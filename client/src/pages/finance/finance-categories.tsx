import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INCOME_CATEGORIES, EXPENSE_GROUPS } from "@/lib/finance-categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";

export default function FinanceCategoriesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Категории доходов и расходов</h2>

      <Card className="border-primary/20 bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Зачем нужны категории?</p>
              <p className="text-muted-foreground">
                При добавлении дохода или расхода вы выбираете категорию (например, «Зарплата», «Продукты», «Такси»).
                Так приложение понимает, <strong>откуда приходят деньги</strong> и <strong>на что уходят</strong>.
                В отчётах и на графике «Расходы по категориям» видно разбивку. В разделе «Бюджеты» можно задать
                лимит по категории (например, не больше 400 ₽ на продукты) — тогда видно, вкладываетесь ли вы в план.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Доходы</CardTitle>
          <p className="text-sm text-muted-foreground">
            Тип поступления: откуда пришли деньги (зарплата, фриланс, подарок и т.д.)
          </p>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {INCOME_CATEGORIES.map((c) => (
              <li
                key={c.id}
                className="px-3 py-2 rounded-md bg-muted/50 text-sm font-medium"
              >
                {c.label}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Расходы</CardTitle>
          <p className="text-sm text-muted-foreground">
            На что потратили: выбираете при добавлении расхода. По ним строится график и лимиты в «Бюджетах».
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {EXPENSE_GROUPS.map((group) => (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger className="font-medium">
                  {group.label}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-wrap gap-2 pt-2">
                    {group.categories.map((c) => (
                      <li
                        key={c.id}
                        className="px-3 py-1.5 rounded-md bg-muted/50 text-sm"
                      >
                        {c.label}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
