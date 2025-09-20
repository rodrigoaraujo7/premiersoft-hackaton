import { MigrateToTable } from '../src/services/MigrateToTable';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

// Mock the pg Client
const mockConnect = jest.fn();
const mockEnd = jest.fn();
const mockQuery = jest.fn();

const mockClient = {
  connect: mockConnect,
  end: mockEnd,
  query: mockQuery,
};

jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => mockClient),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn(),
}));

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('MigrateToTable', () => {
  let migrateToTable: MigrateToTable;

  beforeEach(() => {
    jest.clearAllMocks();
    migrateToTable = new MigrateToTable();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      mockConnect.mockResolvedValue(undefined);

      await migrateToTable.connect();

      expect(mockConnect).toHaveBeenCalled();
    });

    it('should throw error if connection fails', async () => {
      const error = new Error('Connection failed');
      mockConnect.mockRejectedValue(error);

      await expect(migrateToTable.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database successfully', async () => {
      mockEnd.mockResolvedValue(undefined);

      await migrateToTable.disconnect();

      expect(mockEnd).toHaveBeenCalled();
    });

    it('should throw error if disconnection fails', async () => {
      const error = new Error('Disconnection failed');
      mockEnd.mockRejectedValue(error);

      await expect(migrateToTable.disconnect()).rejects.toThrow('Disconnection failed');
    });
  });

  describe('migrate', () => {
    beforeEach(() => {
      // Mock path.join to return predictable paths
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

      // Mock fs operations
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['test1.sql', 'test2.sql']);
      (fs.readFileSync as jest.Mock).mockReturnValue('CREATE TABLE test (id INT);');
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      // Mock database operations
      mockConnect.mockResolvedValue(undefined);
      mockEnd.mockResolvedValue(undefined);
      mockQuery.mockResolvedValue(undefined);
    });

    it('should migrate all SQL files successfully', async () => {
      await migrateToTable.migrate();

      expect(mockConnect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockEnd).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
    });

    it('should handle empty SQL directory', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      await migrateToTable.migrate();

      expect(mockConnect).toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should handle non-existent SQL directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await migrateToTable.migrate();

      expect(mockConnect).toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should throw error if SQL execution fails', async () => {
      const error = new Error('SQL execution failed');
      mockQuery.mockRejectedValue(error);

      await expect(migrateToTable.migrate()).rejects.toThrow('SQL execution failed');
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should throw error if file reading fails', async () => {
      const error = new Error('File reading failed');
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(migrateToTable.migrate()).rejects.toThrow('File reading failed');
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should throw error if file deletion fails', async () => {
      const error = new Error('File deletion failed');
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(migrateToTable.migrate()).rejects.toThrow('File deletion failed');
      expect(mockEnd).toHaveBeenCalled();
    });
  });
});