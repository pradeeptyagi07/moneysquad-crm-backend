export const successResponse = (res: any, data: any, message = "Success") => {
  return res.status(200).json({ success: true, message, data });
};

export const errorResponse = (res: any, error: any) => {
  const status = error?.status || 500;
  const message = error?.message || "Internal Server Error";

  return res.status(status).json({ success: false, message, status });
};


