/**
 * Категории доходов и расходов для финансового модуля.
 * Группы расходов соответствуют ТЗ.
 */

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Зарплата" },
  { id: "freelance", label: "Фриланс" },
  { id: "business", label: "Бизнес" },
  { id: "investments", label: "Инвестиции" },
  { id: "dividends", label: "Дивиденды" },
  { id: "interest", label: "Проценты по счетам" },
  { id: "sales", label: "Продажи" },
  { id: "gifts", label: "Подарки" },
  { id: "refunds", label: "Возвраты" },
  { id: "bonuses", label: "Бонусы" },
  { id: "other_income", label: "Другое" },
] as const;

export type IncomeCategoryId = (typeof INCOME_CATEGORIES)[number]["id"];

export const EXPENSE_GROUPS: {
  id: string;
  label: string;
  categories: { id: string; label: string }[];
}[] = [
  {
    id: "housing",
    label: "Жилье",
    categories: [
      { id: "rent", label: "Аренда" },
      { id: "utilities", label: "Коммунальные платежи" },
      { id: "internet", label: "Интернет" },
      { id: "repair", label: "Ремонт" },
      { id: "furniture", label: "Мебель" },
    ],
  },
  {
    id: "food",
    label: "Еда",
    categories: [
      { id: "groceries", label: "Продукты" },
      { id: "cafe", label: "Кафе" },
      { id: "restaurants", label: "Рестораны" },
      { id: "delivery", label: "Доставка еды" },
      { id: "coffee", label: "Кофе" },
    ],
  },
  {
    id: "transport",
    label: "Транспорт",
    categories: [
      { id: "public_transport", label: "Метро / общественный транспорт" },
      { id: "taxi", label: "Такси" },
      { id: "fuel", label: "Бензин" },
      { id: "parking", label: "Парковка" },
      { id: "car_service", label: "Обслуживание автомобиля" },
    ],
  },
  {
    id: "shopping",
    label: "Покупки",
    categories: [
      { id: "clothing", label: "Одежда" },
      { id: "electronics", label: "Техника" },
      { id: "marketplaces", label: "Маркетплейсы" },
      { id: "home_goods", label: "Товары для дома" },
      { id: "gifts", label: "Подарки" },
    ],
  },
  {
    id: "entertainment",
    label: "Развлечения",
    categories: [
      { id: "cinema", label: "Кино" },
      { id: "games", label: "Игры" },
      { id: "subscriptions", label: "Подписки (Netflix, Spotify и др.)" },
      { id: "travel", label: "Путешествия" },
      { id: "hobby", label: "Хобби" },
    ],
  },
  {
    id: "health",
    label: "Здоровье",
    categories: [
      { id: "pharmacy", label: "Аптека" },
      { id: "doctors", label: "Врачи" },
      { id: "treatment", label: "Лечение" },
      { id: "insurance", label: "Страховка" },
      { id: "sport", label: "Спорт" },
    ],
  },
  {
    id: "finance_ops",
    label: "Финансовые операции",
    categories: [
      { id: "transfers", label: "Переводы" },
      { id: "fees", label: "Комиссии" },
      { id: "loans", label: "Кредиты" },
      { id: "taxes", label: "Налоги" },
    ],
  },
  {
    id: "education",
    label: "Образование",
    categories: [
      { id: "courses", label: "Курсы" },
      { id: "books", label: "Книги" },
      { id: "training", label: "Обучение" },
    ],
  },
  {
    id: "other",
    label: "Другое",
    categories: [
      { id: "pets", label: "Домашние животные" },
      { id: "children", label: "Дети" },
      { id: "charity", label: "Благотворительность" },
      { id: "other_expense", label: "Прочие расходы" },
    ],
  },
];

export const ALL_EXPENSE_CATEGORIES = EXPENSE_GROUPS.flatMap((g) =>
  g.categories.map((c) => ({ ...c, groupId: g.id, groupLabel: g.label }))
);

export type ExpenseCategoryId = (typeof ALL_EXPENSE_CATEGORIES)[number]["id"];

export function getIncomeCategoryLabel(id: string): string {
  return INCOME_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getExpenseCategoryLabel(id: string): string {
  const found = ALL_EXPENSE_CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
}

export function getExpenseGroupLabel(categoryId: string): string {
  const found = ALL_EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
  return found?.groupLabel ?? "";
}

export const PAYMENT_METHODS = [
  { id: "card", label: "Карта" },
  { id: "cash", label: "Наличные" },
  { id: "transfer", label: "Перевод" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const DEFAULT_CURRENCY = "€";
