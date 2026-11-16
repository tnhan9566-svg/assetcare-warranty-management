import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DB_ENABLED = process.env.DB_ENABLED === 'true';

let pool: sql.ConnectionPool | null = null;
let dbConnectionError: string | null = null;

function buildSqlConfig(): sql.config {
  const server = process.env.DB_SERVER || 'localhost';
  const instance = process.env.DB_INSTANCE?.trim();

  const config: sql.config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'AssetCareDB',
    server,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
      ...(instance ? { instanceName: instance } : {}),
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  if (!instance && process.env.DB_PORT) {
    config.port = Number(process.env.DB_PORT);
  }

  return config;
}

async function initDatabase(): Promise<void> {
  if (!DB_ENABLED) {
    console.log('[AssetCare] DB_ENABLED != true -> Running in client-side local storage mode.');
    return;
  }

  try {
    const config = buildSqlConfig();
    pool = await sql.connect(config);
    dbConnectionError = null;
    console.log(`[AssetCare] Connected to SQL Server database: ${config.database} on ${config.server}`);
  } catch (err) {
    pool = null;
    dbConnectionError = err instanceof Error ? err.message : 'Unknown SQL Server connection error';
    console.error('[AssetCare] SQL Server connection failed:', dbConnectionError);
  }
}

function toIsoDate(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const s = String(val);
  return s.includes('T') ? s.split('T')[0] : s;
}

function toIsoDateTime(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) {
    return val.toISOString();
  }
  return String(val);
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      dbEnabled: DB_ENABLED,
      dbConnected: Boolean(pool && pool.connected),
      database: process.env.DB_NAME || 'AssetCareDB',
      error: dbConnectionError,
    });
  });

  // Bootstrap all application tables from SQL Server
  app.get('/api/bootstrap', async (_req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.json({ dbConnected: false });
      return;
    }

    try {
      const [
        usersRes,
        categoriesRes,
        assetsRes,
        warrantiesRes,
        documentsRes,
        repairsRes,
        notificationsRes,
        logsRes,
      ] = await Promise.all([
        pool.request().query('SELECT id, full_name, email, avatar, role, phone, status, created_at FROM dbo.Users ORDER BY created_at ASC'),
        pool.request().query('SELECT id, name, icon, description, default_warranty_months FROM dbo.Categories'),
        pool.request().query('SELECT * FROM dbo.Assets ORDER BY created_at DESC'),
        pool.request().query('SELECT * FROM dbo.Warranties ORDER BY created_at DESC'),
        pool.request().query('SELECT * FROM dbo.Documents ORDER BY uploaded_at DESC'),
        pool.request().query('SELECT * FROM dbo.Repairs ORDER BY repair_date DESC'),
        pool.request().query('SELECT * FROM dbo.Notifications ORDER BY created_at DESC'),
        pool.request().query('SELECT TOP 100 * FROM dbo.ActivityLogs ORDER BY created_at DESC'),
      ]);

      res.json({
        dbConnected: true,
        users: usersRes.recordset.map((r) => ({
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          avatar: r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: r.role,
          phone: r.phone || '',
          status: r.status,
          createdAt: toIsoDateTime(r.created_at),
        })),
        categories: categoriesRes.recordset.map((r) => ({
          id: r.id,
          name: r.name,
          icon: r.icon,
          description: r.description || '',
          defaultWarrantyMonths: Number(r.default_warranty_months),
        })),
        assets: assetsRes.recordset.map((r) => ({
          id: r.id,
          userId: r.user_id,
          categoryId: r.category_id,
          name: r.name,
          brand: r.brand,
          model: r.model || '',
          serialNumber: r.serial_number || '',
          imei: r.imei || undefined,
          purchaseDate: toIsoDate(r.purchase_date),
          purchasePrice: Number(r.purchase_price),
          purchasePlace: r.purchase_place || '',
          description: r.description || '',
          status: r.status,
          imageUrl: r.image_url || undefined,
          createdAt: toIsoDateTime(r.created_at),
          updatedAt: toIsoDateTime(r.updated_at),
        })),
        warranties: warrantiesRes.recordset.map((r) => ({
          id: r.id,
          assetId: r.asset_id,
          provider: r.provider,
          startDate: toIsoDate(r.start_date),
          endDate: toIsoDate(r.end_date),
          durationMonths: Number(r.duration_months),
          terms: r.terms || '',
          hotline: r.hotline || '',
          website: r.website || '',
          policyType: r.policy_type || '',
          createdAt: toIsoDateTime(r.created_at),
        })),
        documents: documentsRes.recordset.map((r) => ({
          id: r.id,
          assetId: r.asset_id,
          name: r.name,
          fileUrl: r.file_url,
          fileType: r.file_type,
          fileSize: r.file_size || '1.0 MB',
          note: r.note || '',
          uploadedAt: toIsoDateTime(r.uploaded_at),
        })),
        repairs: repairsRes.recordset.map((r) => ({
          id: r.id,
          assetId: r.asset_id,
          repairDate: toIsoDate(r.repair_date),
          repairCenter: r.repair_center,
          description: r.description,
          cost: Number(r.cost),
          note: r.note || '',
          technician: r.technician || '',
          warrantyUntil: r.warranty_until ? toIsoDate(r.warranty_until) : undefined,
          createdAt: toIsoDateTime(r.created_at),
        })),
        notifications: notificationsRes.recordset.map((r) => ({
          id: r.id,
          userId: r.user_id,
          assetId: r.asset_id || undefined,
          assetName: r.asset_name || undefined,
          title: r.title,
          message: r.message,
          type: r.type,
          isRead: Boolean(r.is_read),
          createdAt: toIsoDateTime(r.created_at),
        })),
        activityLogs: logsRes.recordset.map((r) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          action: r.action,
          description: r.description,
          createdAt: toIsoDateTime(r.created_at),
        })),
      });
    } catch (err) {
      console.error('Bootstrap SQL Server error:', err);
      res.status(500).json({ dbConnected: false, error: 'Database query failed' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { email, password } = req.body;
    try {
      const result = await pool
        .request()
        .input('email', sql.NVarChar(150), email)
        .query('SELECT id, full_name, email, password, avatar, role, phone, status, created_at FROM dbo.Users WHERE LOWER(email) = LOWER(@email)');

      const user = result.recordset[0];
      if (!user || (password && user.password !== password)) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      res.json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          phone: user.phone || '',
          status: user.status,
          createdAt: toIsoDateTime(user.created_at),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Auth: Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { id, fullName, email, password, avatar } = req.body;
    try {
      await pool
        .request()
        .input('id', sql.NVarChar(50), id)
        .input('fullName', sql.NVarChar(150), fullName)
        .input('email', sql.NVarChar(150), email)
        .input('password', sql.NVarChar(255), password || '123456')
        .input('avatar', sql.NVarChar(500), avatar || '')
        .query(
          `INSERT INTO dbo.Users (id, full_name, email, password, avatar, role, status)
           VALUES (@id, @fullName, @email, @password, @avatar, N'user', N'active')`
        );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Registration failed' });
    }
  });

  // Update User (Profile, Status, Role)
  app.put('/api/users/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { id } = req.params;
    const { fullName, phone, avatar, status, role } = req.body;
    try {
      const request = pool.request().input('id', sql.NVarChar(50), id);
      const updates: string[] = ['updated_at = SYSDATETIME()'];
      if (fullName !== undefined) {
        request.input('fullName', sql.NVarChar(150), fullName);
        updates.push('full_name = @fullName');
      }
      if (phone !== undefined) {
        request.input('phone', sql.NVarChar(30), phone);
        updates.push('phone = @phone');
      }
      if (avatar !== undefined) {
        request.input('avatar', sql.NVarChar(500), avatar);
        updates.push('avatar = @avatar');
      }
      if (status !== undefined) {
        request.input('status', sql.NVarChar(20), status);
        updates.push('status = @status');
      }
      if (role !== undefined) {
        request.input('role', sql.NVarChar(20), role);
        updates.push('role = @role');
      }

      await request.query(`UPDATE dbo.Users SET ${updates.join(', ')} WHERE id = @id`);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Create Asset + Warranty + Optional Initial Document + Notification (Transaction)
  app.post('/api/assets', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { asset, warranty, document, notification } = req.body;
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();

      await new sql.Request(tx)
        .input('id', sql.NVarChar(50), asset.id)
        .input('userId', sql.NVarChar(50), asset.userId)
        .input('categoryId', sql.NVarChar(50), asset.categoryId)
        .input('name', sql.NVarChar(255), asset.name)
        .input('brand', sql.NVarChar(100), asset.brand)
        .input('model', sql.NVarChar(100), asset.model || '')
        .input('serialNumber', sql.NVarChar(100), asset.serialNumber || '')
        .input('imei', sql.NVarChar(100), asset.imei || null)
        .input('purchaseDate', sql.Date, asset.purchaseDate)
        .input('purchasePrice', sql.Decimal(18, 0), asset.purchasePrice || 0)
        .input('purchasePlace', sql.NVarChar(255), asset.purchasePlace || '')
        .input('description', sql.NVarChar(sql.MAX), asset.description || '')
        .input('status', sql.NVarChar(30), asset.status || 'active')
        .input('imageUrl', sql.NVarChar(sql.MAX), asset.imageUrl || null)
        .query(
          `INSERT INTO dbo.Assets (id, user_id, category_id, name, brand, model, serial_number, imei, purchase_date, purchase_price, purchase_place, description, status, image_url)
           VALUES (@id, @userId, @categoryId, @name, @brand, @model, @serialNumber, @imei, @purchaseDate, @purchasePrice, @purchasePlace, @description, @status, @imageUrl)`
        );

      await new sql.Request(tx)
        .input('id', sql.NVarChar(50), warranty.id)
        .input('assetId', sql.NVarChar(50), asset.id)
        .input('provider', sql.NVarChar(200), warranty.provider)
        .input('startDate', sql.Date, warranty.startDate)
        .input('endDate', sql.Date, warranty.endDate)
        .input('durationMonths', sql.Int, warranty.durationMonths)
        .input('terms', sql.NVarChar(sql.MAX), warranty.terms || '')
        .input('hotline', sql.NVarChar(50), warranty.hotline || '')
        .input('website', sql.NVarChar(300), warranty.website || '')
        .input('policyType', sql.NVarChar(150), warranty.policyType || '')
        .query(
          `INSERT INTO dbo.Warranties (id, asset_id, provider, start_date, end_date, duration_months, terms, hotline, website, policy_type)
           VALUES (@id, @assetId, @provider, @startDate, @endDate, @durationMonths, @terms, @hotline, @website, @policyType)`
        );

      if (document) {
        await new sql.Request(tx)
          .input('id', sql.NVarChar(50), document.id)
          .input('assetId', sql.NVarChar(50), asset.id)
          .input('name', sql.NVarChar(255), document.name)
          .input('fileUrl', sql.NVarChar(sql.MAX), document.fileUrl)
          .input('fileType', sql.NVarChar(30), document.fileType)
          .input('fileSize', sql.NVarChar(50), document.fileSize || '1.0 MB')
          .input('note', sql.NVarChar(500), document.note || '')
          .query(
            `INSERT INTO dbo.Documents (id, asset_id, name, file_url, file_type, file_size, note)
             VALUES (@id, @assetId, @name, @fileUrl, @fileType, @fileSize, @note)`
          );
      }

      if (notification) {
        await new sql.Request(tx)
          .input('id', sql.NVarChar(50), notification.id)
          .input('userId', sql.NVarChar(50), asset.userId)
          .input('assetId', sql.NVarChar(50), asset.id)
          .input('assetName', sql.NVarChar(255), asset.name)
          .input('title', sql.NVarChar(255), notification.title)
          .input('message', sql.NVarChar(sql.MAX), notification.message)
          .input('type', sql.NVarChar(30), notification.type)
          .query(
            `INSERT INTO dbo.Notifications (id, user_id, asset_id, asset_name, title, message, type, is_read)
             VALUES (@id, @userId, @assetId, @assetName, @title, @message, @type, 0)`
          );
      }

      await tx.commit();
      res.json({ ok: true });
    } catch (err) {
      await tx.rollback().catch(() => {});
      console.error(err);
      res.status(500).json({ error: 'Failed to create asset' });
    }
  });

  // Update Asset & Warranty
  app.put('/api/assets/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { id } = req.params;
    const { assetData, warrantyData } = req.body;
    try {
      if (assetData) {
        await pool
          .request()
          .input('id', sql.NVarChar(50), id)
          .input('categoryId', sql.NVarChar(50), assetData.categoryId)
          .input('name', sql.NVarChar(255), assetData.name)
          .input('brand', sql.NVarChar(100), assetData.brand)
          .input('model', sql.NVarChar(100), assetData.model || '')
          .input('serialNumber', sql.NVarChar(100), assetData.serialNumber || '')
          .input('imei', sql.NVarChar(100), assetData.imei || null)
          .input('purchaseDate', sql.Date, assetData.purchaseDate)
          .input('purchasePrice', sql.Decimal(18, 0), assetData.purchasePrice || 0)
          .input('purchasePlace', sql.NVarChar(255), assetData.purchasePlace || '')
          .input('description', sql.NVarChar(sql.MAX), assetData.description || '')
          .input('imageUrl', sql.NVarChar(sql.MAX), assetData.imageUrl || null)
          .query(
            `UPDATE dbo.Assets
             SET category_id = @categoryId, name = @name, brand = @brand, model = @model,
                 serial_number = @serialNumber, imei = @imei, purchase_date = @purchaseDate,
                 purchase_price = @purchasePrice, purchase_place = @purchasePlace,
                 description = @description, image_url = @imageUrl, updated_at = SYSDATETIME()
             WHERE id = @id`
          );
      }

      if (warrantyData) {
        await pool
          .request()
          .input('assetId', sql.NVarChar(50), id)
          .input('provider', sql.NVarChar(200), warrantyData.provider)
          .input('startDate', sql.Date, warrantyData.startDate)
          .input('endDate', sql.Date, warrantyData.endDate)
          .input('durationMonths', sql.Int, warrantyData.durationMonths)
          .input('terms', sql.NVarChar(sql.MAX), warrantyData.terms || '')
          .input('hotline', sql.NVarChar(50), warrantyData.hotline || '')
          .input('website', sql.NVarChar(300), warrantyData.website || '')
          .input('policyType', sql.NVarChar(150), warrantyData.policyType || '')
          .query(
            `UPDATE dbo.Warranties
             SET provider = @provider, start_date = @startDate, end_date = @endDate,
                 duration_months = @durationMonths, terms = @terms, hotline = @hotline,
                 website = @website, policy_type = @policyType
             WHERE asset_id = @assetId`
          );
      }

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update asset' });
    }
  });

  // Delete Asset
  app.delete('/api/assets/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { id } = req.params;
    try {
      await pool.request().input('id', sql.NVarChar(50), id).query('DELETE FROM dbo.Notifications WHERE asset_id = @id');
      await pool.request().input('id', sql.NVarChar(50), id).query('DELETE FROM dbo.Assets WHERE id = @id');
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  });

  // Documents CRUD
  app.post('/api/documents', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const doc = req.body;
    try {
      await pool
        .request()
        .input('id', sql.NVarChar(50), doc.id)
        .input('assetId', sql.NVarChar(50), doc.assetId)
        .input('name', sql.NVarChar(255), doc.name)
        .input('fileUrl', sql.NVarChar(sql.MAX), doc.fileUrl)
        .input('fileType', sql.NVarChar(30), doc.fileType)
        .input('fileSize', sql.NVarChar(50), doc.fileSize || '1.0 MB')
        .input('note', sql.NVarChar(500), doc.note || '')
        .query(
          `INSERT INTO dbo.Documents (id, asset_id, name, file_url, file_type, file_size, note)
           VALUES (@id, @assetId, @name, @fileUrl, @fileType, @fileSize, @note)`
        );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add document' });
    }
  });

  app.delete('/api/documents/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    try {
      await pool.request().input('id', sql.NVarChar(50), req.params.id).query('DELETE FROM dbo.Documents WHERE id = @id');
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // Repairs CRUD
  app.post('/api/repairs', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const rep = req.body;
    try {
      await pool
        .request()
        .input('id', sql.NVarChar(50), rep.id)
        .input('assetId', sql.NVarChar(50), rep.assetId)
        .input('repairDate', sql.Date, rep.repairDate)
        .input('repairCenter', sql.NVarChar(255), rep.repairCenter)
        .input('description', sql.NVarChar(sql.MAX), rep.description)
        .input('cost', sql.Decimal(18, 0), rep.cost || 0)
        .input('note', sql.NVarChar(sql.MAX), rep.note || '')
        .input('technician', sql.NVarChar(120), rep.technician || '')
        .input('warrantyUntil', sql.Date, rep.warrantyUntil || null)
        .query(
          `INSERT INTO dbo.Repairs (id, asset_id, repair_date, repair_center, description, cost, note, technician, warranty_until)
           VALUES (@id, @assetId, @repairDate, @repairCenter, @description, @cost, @note, @technician, @warrantyUntil)`
        );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add repair' });
    }
  });

  app.delete('/api/repairs/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    try {
      await pool.request().input('id', sql.NVarChar(50), req.params.id).query('DELETE FROM dbo.Repairs WHERE id = @id');
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete repair' });
    }
  });

  // Notifications
  app.put('/api/notifications/:id/read', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    try {
      await pool.request().input('id', sql.NVarChar(50), req.params.id).query('UPDATE dbo.Notifications SET is_read = 1 WHERE id = @id');
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to mark notification read' });
    }
  });

  app.put('/api/notifications/read-all', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    try {
      await pool.request().input('userId', sql.NVarChar(50), req.body.userId).query('UPDATE dbo.Notifications SET is_read = 1 WHERE user_id = @userId');
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to mark all notifications read' });
    }
  });

  // Categories
  app.post('/api/categories', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const cat = req.body;
    try {
      await pool
        .request()
        .input('id', sql.NVarChar(50), cat.id)
        .input('name', sql.NVarChar(120), cat.name)
        .input('icon', sql.NVarChar(50), cat.icon || 'Cpu')
        .input('description', sql.NVarChar(500), cat.description || '')
        .input('months', sql.Int, cat.defaultWarrantyMonths || 12)
        .query(
          `INSERT INTO dbo.Categories (id, name, icon, description, default_warranty_months)
           VALUES (@id, @name, @icon, @description, @months)`
        );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  app.put('/api/categories/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const { id } = req.params;
    const { name, icon, description, defaultWarrantyMonths } = req.body;
    try {
      const request = pool.request().input('id', sql.NVarChar(50), id);
      const updates: string[] = [];
      if (name !== undefined) {
        request.input('name', sql.NVarChar(120), name);
        updates.push('name = @name');
      }
      if (icon !== undefined) {
        request.input('icon', sql.NVarChar(50), icon);
        updates.push('icon = @icon');
      }
      if (description !== undefined) {
        request.input('description', sql.NVarChar(500), description);
        updates.push('description = @description');
      }
      if (defaultWarrantyMonths !== undefined) {
        request.input('months', sql.Int, defaultWarrantyMonths);
        updates.push('default_warranty_months = @months');
      }
      if (updates.length > 0) {
        await request.query(`UPDATE dbo.Categories SET ${updates.join(', ')} WHERE id = @id`);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    try {
      await pool.request().input('id', sql.NVarChar(50), req.params.id).query('DELETE FROM dbo.Categories WHERE id = @id');
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Activity Logs
  app.post('/api/logs', async (req: Request, res: Response) => {
    if (!pool || !pool.connected) {
      res.status(503).json({ error: 'SQL Server not connected' });
      return;
    }
    const log = req.body;
    try {
      await pool
        .request()
        .input('id', sql.NVarChar(50), log.id)
        .input('userId', sql.NVarChar(50), log.userId)
        .input('userName', sql.NVarChar(150), log.userName)
        .input('action', sql.NVarChar(150), log.action)
        .input('description', sql.NVarChar(sql.MAX), log.description)
        .query(
          `INSERT INTO dbo.ActivityLogs (id, user_id, user_name, action, description)
           VALUES (@id, @userId, @userName, @action, @description)`
        );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to record log' });
    }
  });

  // Vite middleware in dev / static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AssetCare] Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
