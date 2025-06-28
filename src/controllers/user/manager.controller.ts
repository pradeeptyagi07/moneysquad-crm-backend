import { Request, Response } from 'express';
import { userSchema } from '../../validation/user.validation';
import { managerService } from '../../services/user/manager.service';

export const managerController = {
  async createManager(req: Request, res: Response) {
    try {
      const validated = userSchema.parse(req.body);
      const newManager = await managerService.createManager(validated);
      res.status(201).json({
        status: true,
        message: 'Manager created successfully',
        response: newManager
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  async getAllManager(req: Request, res: Response) {
    try {
      const managers = await managerService.getAllManager();
      res.json({
        status: true,
        message: 'All managers fetched successfully',
        response: managers
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  async getByIdManager(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const manager = await managerService.getManager(id);
      res.json({
        status: true,
        message: 'Manager fetched successfully',
        response: manager
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  async updateManager(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await managerService.updateManager(id, req.body);
      res.json({
        status: true,
        message: 'Manager updated successfully',
        response: updated
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  async deleteManager(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await managerService.deleteManager(id);
      res.json({
        status: true,
        message: 'Manager deleted successfully',
        response: null
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }
};
