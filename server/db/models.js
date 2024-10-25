import { v4 as uuidv4 } from 'uuid';
import { query, getOne } from './index.js';

export const UserModel = {
  create: ({ name, email, password }) => {
    const id = uuidv4();
    query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, password]
    );
    return getOne('SELECT id, name, email FROM users WHERE id = ?', [id]);
  },

  findByEmail: (email) => {
    return getOne('SELECT * FROM users WHERE email = ?', [email]);
  },

  findById: (id) => {
    return getOne('SELECT id, name, email FROM users WHERE id = ?', [id]);
  }
};

export const ProjectModel = {
  create: ({ name, description, userId }) => {
    const id = uuidv4();
    query(
      'INSERT INTO projects (id, name, description, user_id) VALUES (?, ?, ?, ?)',
      [id, name, description, userId]
    );
    return getOne('SELECT * FROM projects WHERE id = ?', [id]);
  },

  findByUserId: (userId) => {
    return query('SELECT * FROM projects WHERE user_id = ?', [userId]);
  },

  update: ({ id, name, description, status }) => {
    query(
      'UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ?',
      [name, description, status, id]
    );
    return getOne('SELECT * FROM projects WHERE id = ?', [id]);
  },

  delete: (id) => {
    return query('DELETE FROM projects WHERE id = ?', [id]);
  }
};

export const ConversionModel = {
  create: ({ projectId, fileId }) => {
    const id = uuidv4();
    query(
      'INSERT INTO conversions (id, project_id, file_id) VALUES (?, ?, ?)',
      [id, projectId, fileId]
    );
    return getOne('SELECT * FROM conversions WHERE id = ?', [id]);
  },

  createStep: ({ conversionId, type }) => {
    const id = uuidv4();
    query(
      'INSERT INTO conversion_steps (id, conversion_id, type) VALUES (?, ?, ?)',
      [id, conversionId, type]
    );
    return getOne('SELECT * FROM conversion_steps WHERE id = ?', [id]);
  },

  updateStep: ({ id, status, data, error }) => {
    const now = new Date().toISOString();
    query(
      `UPDATE conversion_steps 
       SET status = ?, 
           data = ?, 
           error = ?,
           started_at = CASE WHEN status = 'IN_PROGRESS' THEN ? ELSE started_at END,
           completed_at = CASE WHEN status = 'COMPLETED' THEN ? ELSE completed_at END
       WHERE id = ?`,
      [status, data, error, now, now, id]
    );
    return getOne('SELECT * FROM conversion_steps WHERE id = ?', [id]);
  },

  findById: (id) => {
    const conversion = getOne('SELECT * FROM conversions WHERE id = ?', [id]);
    if (conversion) {
      conversion.steps = query(
        'SELECT * FROM conversion_steps WHERE conversion_id = ?',
        [id]
      );
    }
    return conversion;
  },

  update: ({ id, originalData, convertedData }) => {
    query(
      'UPDATE conversions SET original_data = ?, converted_data = ? WHERE id = ?',
      [
        originalData ? JSON.stringify(originalData) : null,
        convertedData ? JSON.stringify(convertedData) : null,
        id
      ]
    );
    return getOne('SELECT * FROM conversions WHERE id = ?', [id]);
  }
};

export const FileModel = {
  create: ({ name, type, path, projectId }) => {
    const id = uuidv4();
    query(
      'INSERT INTO files (id, name, type, path, project_id) VALUES (?, ?, ?, ?, ?)',
      [id, name, type, path, projectId]
    );
    return getOne('SELECT * FROM files WHERE id = ?', [id]);
  },

  findByProjectId: (projectId) => {
    return query('SELECT * FROM files WHERE project_id = ?', [projectId]);
  },

  delete: (id) => {
    return query('DELETE FROM files WHERE id = ?', [id]);
  }
};

export const ReportModel = {
  create: ({ name, content, type, projectId, conversionId }) => {
    const id = uuidv4();
    query(
      'INSERT INTO reports (id, name, content, type, project_id, conversion_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, content, type, projectId, conversionId]
    );
    return getOne('SELECT * FROM reports WHERE id = ?', [id]);
  },

  findByProjectId: (projectId) => {
    return query('SELECT * FROM reports WHERE project_id = ?', [projectId]);
  },

  update: ({ id, name, content, type }) => {
    query(
      'UPDATE reports SET name = ?, content = ?, type = ? WHERE id = ?',
      [name, content, type, id]
    );
    return getOne('SELECT * FROM reports WHERE id = ?', [id]);
  },

  delete: (id) => {
    return query('DELETE FROM reports WHERE id = ?', [id]);
  }
};