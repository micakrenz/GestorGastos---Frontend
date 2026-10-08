export type Expense = {
  id: number;
  category: string;
  description: string;
  time: string;
  amount: string;
  color: string;
  date: string;
  fullDate: string;
  paymentMethod: string;
  note: string;
  zone: string;
};

export const expenses: Expense[] = [
  {
    id: 1,
    category: "Comida",
    description: "McDonald's",
    time: "12:45",
    amount: "$12.500",
    color: "#F97316",
    date: "Hoy",
    fullDate: "18 de septiembre de 2026",
    paymentMethod: "Tarjeta de débito",
    note: "Almuerzo con amigos",
    zone: "Caballito",
  },
  {
    id: 2,
    category: "Transporte",
    description: "Uber",
    time: "09:20",
    amount: "$8.500",
    color: "#3B82F6",
    date: "Hoy",
    fullDate: "18 de septiembre de 2026",
    paymentMethod: "Tarjeta de crédito",
    note: "Viaje a la universidad",
    zone: "Puerto Madero",
  },
  {
    id: 3,
    category: "Compras",
    description: "Zara",
    time: "18:30",
    amount: "$24.000",
    color: "#A855F7",
    date: "Ayer",
    fullDate: "17 de septiembre de 2026",
    paymentMethod: "Tarjeta de crédito",
    note: "Ropa",
    zone: "Palermo",
  },
  {
    id: 4,
    category: "Entretenimiento",
    description: "Cine",
    time: "21:15",
    amount: "$9.500",
    color: "#EC4899",
    date: "Ayer",
    fullDate: "17 de septiembre de 2026",
    paymentMethod: "Efectivo",
    note: "Salida con amigos",
    zone: "Belgrano",
  },
  {
    id: 5,
    category: "Comida",
    description: "Starbucks",
    time: "16:10",
    amount: "$6.500",
    color: "#F97316",
    date: "12 Sep",
    fullDate: "12 de septiembre de 2026",
    paymentMethod: "Tarjeta de débito",
    note: "Café",
    zone: "Microcentro",
  },
  {
    id: 6,
    category: "Otros",
    description: "Farmacia",
    time: "11:05",
    amount: "$7.800",
    color: "#10B981",
    date: "12 Sep",
    fullDate: "12 de septiembre de 2026",
    paymentMethod: "Efectivo",
    note: "Compra de medicamentos",
    zone: "Flores",
  },
];
