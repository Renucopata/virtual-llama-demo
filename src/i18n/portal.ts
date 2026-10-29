// Strings for the demo portal (login, agent profile, admin). Kept apart from the marketing Dict.
// Placeholders like {name} are filled with fmt().
import type { Lang } from './types';
import type { AgentStatus, DocStatus, PaymentStatus, Permission, Role } from '@/portal/data';

export interface PortalDict {
  common: {
    logout: string;
    loading: string;
    reset: string;
    signedInAs: string;
    agentStatus: Record<AgentStatus, string>;
    paymentStatus: Record<PaymentStatus, string>;
    docStatus: Record<DocStatus, string>;
    roles: Record<Role, string>;
    permissions: Record<Permission, string>;
    save: string;
    cancel: string;
    edit: string;
    noValue: string;
  };
  login: {
    title: string;
    lead: string;
    email: string;
    password: string;
    submit: string;
    error: string;
    demoTitle: string;
    demoHint: string;
    agent: string;
    admin: string;
    back: string;
  };
  agent: {
    hello: string;
    lead: string;
    personal: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    birthDate: string;
    nationalId: string;
    emergency: string;
    job: string;
    position: string;
    client: string;
    schedule: string;
    timezone: string;
    startDate: string;
    status: string;
    pay: string;
    nextPayment: string;
    noUpcoming: string;
    monthly: string;
    bank: string;
    history: string;
    date: string;
    concept: string;
    amount: string;
    docs: string;
    download: string;
    downloadDemo: string;
    custom: string;
    customLead: string;
  };
  admin: {
    title: string;
    tabs: { overview: string; people: string; roles: string; fields: string };
    kpiActive: string;
    kpiOnboarding: string;
    kpiUpcoming: string;
    kpiUpcomingNote: string;
    kpiPayroll: string;
    byClient: string;
    upcomingTitle: string;
    search: string;
    allClients: string;
    allStatuses: string;
    add: string;
    export: string;
    exported: string;
    colName: string;
    colPosition: string;
    colClient: string;
    colStatus: string;
    colSalary: string;
    colNextPay: string;
    noResults: string;
    results: string;
    newTitle: string;
    editTitle: string;
    profileSection: string;
    jobSection: string;
    paymentsSection: string;
    customSection: string;
    firstName: string;
    lastName: string;
    salary: string;
    shiftStart: string;
    shiftEnd: string;
    shiftDays: string;
    addPayment: string;
    remove: string;
    readOnly: string;
    noPaymentsPermission: string;
    rolesTitle: string;
    rolesLead: string;
    colUser: string;
    colRole: string;
    colLastLogin: string;
    matrixTitle: string;
    noRolesPermission: string;
    fieldsTitle: string;
    fieldsLead: string;
    fieldLabelEn: string;
    fieldLabelEs: string;
    addField: string;
    noAccess: string;
  };
}

const en: PortalDict = {
  common: {
    logout: 'Log out',
    loading: 'Loading…',
    reset: 'Reset demo data',
    signedInAs: 'Signed in as {name} · {role}',
    agentStatus: { active: 'Active', onboarding: 'Onboarding', inactive: 'Inactive' },
    paymentStatus: { paid: 'Paid', scheduled: 'Scheduled', pending: 'Pending approval' },
    docStatus: { signed: 'Signed', pending: 'Pending signature', valid: 'Valid', expired: 'Expired' },
    roles: { superadmin: 'Super admin', hr: 'Human resources', payroll: 'Payroll', viewer: 'Viewer' },
    permissions: {
      'profiles.view': 'View profiles',
      'profiles.edit': 'Create & edit profiles',
      'payments.edit': 'Edit payments',
      export: 'Export data',
      'roles.manage': 'Manage roles',
    },
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    noValue: '—',
  },
  login: {
    title: 'Log in',
    lead: 'Access your Virtual Llama account.',
    email: 'Email',
    password: 'Password',
    submit: 'Log in',
    error: 'Wrong email or password.',
    demoTitle: 'Demo accounts',
    demoHint: 'Click an account to fill in its details. Password for all: {password}',
    agent: 'Agent',
    admin: 'Admin',
    back: 'Back to site',
  },
  agent: {
    hello: 'Hi, {name}',
    lead: 'This is your Virtual Llama profile.',
    personal: 'Personal & contact details',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    address: 'Address',
    birthDate: 'Date of birth',
    nationalId: 'ID number',
    emergency: 'Emergency contact',
    job: 'Position & schedule',
    position: 'Position',
    client: 'Assigned client',
    schedule: 'Schedule',
    timezone: 'Bolivia time (UTC-4)',
    startDate: 'Start date',
    status: 'Status',
    pay: 'Payments',
    nextPayment: 'Next payment',
    noUpcoming: 'No upcoming payments',
    monthly: 'Monthly salary',
    bank: 'Deposit account',
    history: 'Payment history',
    date: 'Date',
    concept: 'Concept',
    amount: 'Amount',
    docs: 'Documents & contract',
    download: 'Download',
    downloadDemo: 'Downloads are disabled in the demo.',
    custom: 'Additional information',
    customLead: 'Fields defined by Virtual Llama.',
  },
  admin: {
    title: 'Admin dashboard',
    tabs: { overview: 'Overview', people: 'Team', roles: 'Roles & permissions', fields: 'Custom fields' },
    kpiActive: 'Active agents',
    kpiOnboarding: 'In onboarding',
    kpiUpcoming: 'Next payday',
    kpiUpcomingNote: '{date} · {count} payments',
    kpiPayroll: 'Monthly payroll',
    byClient: 'Agents by client',
    upcomingTitle: 'Next payments',
    search: 'Search by name, email, position or client…',
    allClients: 'All clients',
    allStatuses: 'All statuses',
    add: 'New agent',
    export: 'Export to Excel',
    exported: 'File downloaded',
    colName: 'Name',
    colPosition: 'Position',
    colClient: 'Client',
    colStatus: 'Status',
    colSalary: 'Salary',
    colNextPay: 'Next payment',
    noResults: 'No agents match your search.',
    results: '{count} agents',
    newTitle: 'New agent',
    editTitle: 'Edit {name}',
    profileSection: 'Profile',
    jobSection: 'Position & schedule',
    paymentsSection: 'Payments',
    customSection: 'Custom fields',
    firstName: 'First name',
    lastName: 'Last name',
    salary: 'Monthly salary (USD)',
    shiftStart: 'Shift start',
    shiftEnd: 'Shift end',
    shiftDays: 'Working days',
    addPayment: 'Add payment',
    remove: 'Remove',
    readOnly: 'Your role can view but not edit profiles.',
    noPaymentsPermission: 'Your role cannot edit payments.',
    rolesTitle: 'Portal users',
    rolesLead: 'Each admin user has one role. Roles define what they can do.',
    colUser: 'User',
    colRole: 'Role',
    colLastLogin: 'Last login',
    matrixTitle: 'Permissions by role',
    noRolesPermission: 'Only users with “Manage roles” can change roles and permissions.',
    fieldsTitle: 'Custom profile fields',
    fieldsLead: 'Extra fields Virtual Llama tracks for every agent. They appear on each agent’s profile.',
    fieldLabelEn: 'Label (English)',
    fieldLabelEs: 'Label (Spanish)',
    addField: 'Add field',
    noAccess: 'This area is for admins.',
  },
};

const es: PortalDict = {
  common: {
    logout: 'Cerrar sesión',
    loading: 'Cargando…',
    reset: 'Restablecer datos demo',
    signedInAs: 'Sesión de {name} · {role}',
    agentStatus: { active: 'Activo', onboarding: 'En incorporación', inactive: 'Inactivo' },
    paymentStatus: { paid: 'Pagado', scheduled: 'Programado', pending: 'Por aprobar' },
    docStatus: { signed: 'Firmado', pending: 'Firma pendiente', valid: 'Vigente', expired: 'Vencido' },
    roles: { superadmin: 'Superadministrador', hr: 'Recursos humanos', payroll: 'Planillas', viewer: 'Solo lectura' },
    permissions: {
      'profiles.view': 'Ver perfiles',
      'profiles.edit': 'Crear y editar perfiles',
      'payments.edit': 'Editar pagos',
      export: 'Exportar datos',
      'roles.manage': 'Gestionar roles',
    },
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    noValue: '—',
  },
  login: {
    title: 'Iniciar sesión',
    lead: 'Acceda a su cuenta de Virtual Llama.',
    email: 'Correo electrónico',
    password: 'Contraseña',
    submit: 'Ingresar',
    error: 'Correo o contraseña incorrectos.',
    demoTitle: 'Cuentas de demostración',
    demoHint: 'Haga clic en una cuenta para completar sus datos. Contraseña de todas: {password}',
    agent: 'Agente',
    admin: 'Admin',
    back: 'Volver al sitio',
  },
  agent: {
    hello: 'Hola, {name}',
    lead: 'Este es su perfil en Virtual Llama.',
    personal: 'Datos personales y de contacto',
    email: 'Correo',
    phone: 'Teléfono',
    city: 'Ciudad',
    address: 'Dirección',
    birthDate: 'Fecha de nacimiento',
    nationalId: 'Cédula de identidad',
    emergency: 'Contacto de emergencia',
    job: 'Puesto y horario',
    position: 'Puesto',
    client: 'Cliente asignado',
    schedule: 'Horario',
    timezone: 'Hora de Bolivia (UTC-4)',
    startDate: 'Fecha de ingreso',
    status: 'Estado',
    pay: 'Pagos',
    nextPayment: 'Próximo pago',
    noUpcoming: 'No hay pagos próximos',
    monthly: 'Sueldo mensual',
    bank: 'Cuenta de depósito',
    history: 'Historial de pagos',
    date: 'Fecha',
    concept: 'Concepto',
    amount: 'Monto',
    docs: 'Documentos y contrato',
    download: 'Descargar',
    downloadDemo: 'Las descargas están desactivadas en la demo.',
    custom: 'Información adicional',
    customLead: 'Campos definidos por Virtual Llama.',
  },
  admin: {
    title: 'Panel de administración',
    tabs: { overview: 'Resumen', people: 'Colaboradores', roles: 'Roles y permisos', fields: 'Campos adicionales' },
    kpiActive: 'Agentes activos',
    kpiOnboarding: 'En incorporación',
    kpiUpcoming: 'Próximo día de pago',
    kpiUpcomingNote: '{date} · {count} pagos',
    kpiPayroll: 'Planilla mensual',
    byClient: 'Agentes por cliente',
    upcomingTitle: 'Próximos pagos',
    search: 'Buscar por nombre, correo, puesto o cliente…',
    allClients: 'Todos los clientes',
    allStatuses: 'Todos los estados',
    add: 'Nuevo agente',
    export: 'Exportar a Excel',
    exported: 'Archivo descargado',
    colName: 'Nombre',
    colPosition: 'Puesto',
    colClient: 'Cliente',
    colStatus: 'Estado',
    colSalary: 'Sueldo',
    colNextPay: 'Próximo pago',
    noResults: 'Ningún agente coincide con la búsqueda.',
    results: '{count} agentes',
    newTitle: 'Nuevo agente',
    editTitle: 'Editar a {name}',
    profileSection: 'Perfil',
    jobSection: 'Puesto y horario',
    paymentsSection: 'Pagos',
    customSection: 'Campos adicionales',
    firstName: 'Nombres',
    lastName: 'Apellidos',
    salary: 'Sueldo mensual (USD)',
    shiftStart: 'Inicio de turno',
    shiftEnd: 'Fin de turno',
    shiftDays: 'Días laborales',
    addPayment: 'Agregar pago',
    remove: 'Quitar',
    readOnly: 'Su rol puede ver pero no editar perfiles.',
    noPaymentsPermission: 'Su rol no puede editar pagos.',
    rolesTitle: 'Usuarios del portal',
    rolesLead: 'Cada usuario administrador tiene un rol. Los roles definen lo que puede hacer.',
    colUser: 'Usuario',
    colRole: 'Rol',
    colLastLogin: 'Último ingreso',
    matrixTitle: 'Permisos por rol',
    noRolesPermission: 'Solo los usuarios con “Gestionar roles” pueden cambiar roles y permisos.',
    fieldsTitle: 'Campos adicionales del perfil',
    fieldsLead: 'Datos extra que Virtual Llama registra de cada agente. Aparecen en el perfil de cada agente.',
    fieldLabelEn: 'Etiqueta (inglés)',
    fieldLabelEs: 'Etiqueta (español)',
    addField: 'Agregar campo',
    noAccess: 'Esta área es solo para administradores.',
  },
};

export const portalDict: Record<Lang, PortalDict> = { en, es };

export const fmt = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
