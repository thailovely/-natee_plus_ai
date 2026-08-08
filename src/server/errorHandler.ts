import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 [Global Error Handler] Caught an error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export const setupProcessErrorHandlers = () => {
  process.on('uncaughtException', (err) => {
    console.error('🔥 [uncaughtException] Server caught unhandled exception:', err);
    // Optionally: exit process and let PM2 or Cloud Run restart it
    // process.exit(1); 
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 [unhandledRejection] Server caught unhandled promise rejection at:', promise, 'reason:', reason);
  });
};
