import { Request, Response, NextFunction } from 'express';
import { AbsenceModel } from '../../infrastructure/database/models/absenceModel';
import { EmployeeModel } from '../../infrastructure/database/models/employeeModel';

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const submitAbsence = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user || !user.email) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const employee = await EmployeeModel.findOne({ email: user.email });
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found for the logged-in user' });
  }

  const { type_absence, date_debut, date_fin, commentaire } = req.body;

  if (!type_absence || !date_debut || !date_fin) {
    return res.status(400).json({ error: 'Missing required absence fields' });
  }

  const newAbsence = new AbsenceModel({
    employe_id: employee._id,
    type_absence,
    date_debut,
    date_fin,
    commentaire,
    statut: 'pending', 
  });

  await newAbsence.save();

  res.status(201).json({ message: 'Absence request submitted successfully', absence: newAbsence });
}); 