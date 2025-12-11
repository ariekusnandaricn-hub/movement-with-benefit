import { describe, it, expect, vi } from 'vitest';
import { exportToCSV, exportToExcel, exportSummaryToExcel, getFormattedDate } from '../exportUtils';

describe('Export Utilities', () => {
  // Mock window.URL.createObjectURL
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  describe('getFormattedDate', () => {
    it('should return formatted date string', () => {
      const result = getFormattedDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const mockData = [
        {
          registrationNumber: 'REG001',
          fullName: 'John Doe',
          email: 'john@example.com',
          whatsappNumber: '081234567890',
          category: 'Vocal',
          province: 'Jakarta',
          invoiceId: 'MWB-V.250.0101',
          invoiceAmount: 250010101,
          paymentStatus: 'verified',
          createdAt: '2025-12-11T10:00:00Z',
        },
      ];

      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      exportToCSV(mockData, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel format', () => {
      const mockData = [
        {
          registrationNumber: 'REG001',
          fullName: 'John Doe',
          email: 'john@example.com',
          whatsappNumber: '081234567890',
          category: 'Acting',
          province: 'Bandung',
          invoiceId: 'MWB-A.250.0102',
          invoiceAmount: 250010102,
          paymentStatus: 'pending_verification',
          createdAt: '2025-12-11T10:00:00Z',
        },
      ];

      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      exportToExcel(mockData, 'test.xlsx');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('exportSummaryToExcel', () => {
    it('should export summary data to Excel format', () => {
      const mockData = [
        {
          registrationNumber: 'REG001',
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          whatsappNumber: '081234567891',
          category: 'Model',
          province: 'Surabaya',
          invoiceId: 'MWB-M.250.0103',
          invoiceAmount: 250010103,
          paymentStatus: 'verified',
          createdAt: '2025-12-11T10:00:00Z',
        },
      ];

      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      exportSummaryToExcel(mockData, 'summary.xlsx');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
