import { Department } from '@prisma/client'

export type UserWithDepartment = {
  department: Department
}

export function getDepartmentWhere(
  user: { department: Department | string },
  selectedDepartment?: Department | string
) {
  // Presidencia con GLOBAL puede elegir ver todos o filtrar
  // Si user.department es string 'GLOBAL' o enum GLOBAL
  if (user.department === 'GLOBAL') {
    // Si no selecciona nada o selecciona GLOBAL, ve todo
    if (!selectedDepartment || selectedDepartment === 'GLOBAL') {
      return {}
    }
    // Si selecciona un departamento específico, filtramos por él
    return { department: selectedDepartment }
  }

  // Usuarios normales ven solo su propio departamento
  return { department: user.department }
}
