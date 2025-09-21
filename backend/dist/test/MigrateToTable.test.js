"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const MigrateToTable_1 = require("../src/services/MigrateToTable");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
    let migrateToTable;
    beforeEach(() => {
        jest.clearAllMocks();
        migrateToTable = new MigrateToTable_1.MigrateToTable();
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
            path.join.mockImplementation((...args) => args.join('/'));
            // Mock fs operations
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['test1.sql', 'test2.sql']);
            fs.readFileSync.mockReturnValue('CREATE TABLE test (id INT);');
            fs.unlinkSync.mockReturnValue(undefined);
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
            fs.readdirSync.mockReturnValue([]);
            await migrateToTable.migrate();
            expect(mockConnect).toHaveBeenCalled();
            expect(mockQuery).not.toHaveBeenCalled();
            expect(mockEnd).toHaveBeenCalled();
        });
        it('should handle non-existent SQL directory', async () => {
            fs.existsSync.mockReturnValue(false);
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
            fs.readFileSync.mockImplementation(() => {
                throw error;
            });
            await expect(migrateToTable.migrate()).rejects.toThrow('File reading failed');
            expect(mockEnd).toHaveBeenCalled();
        });
        it('should throw error if file deletion fails', async () => {
            const error = new Error('File deletion failed');
            fs.unlinkSync.mockImplementation(() => {
                throw error;
            });
            await expect(migrateToTable.migrate()).rejects.toThrow('File deletion failed');
            expect(mockEnd).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=MigrateToTable.test.js.map