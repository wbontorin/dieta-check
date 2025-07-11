// Aplicativo de controle de dieta e exercícios - 40 dias
// Tecnologias: React + TailwindCSS + Google Sheets API

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

const SHEET_API_URL = 'https://api.sheetbest.com/sheets/b77e4383-6548-4908-9d43-36226cc8c135';

const startDate = new Date('2025-07-11');
const days = 40;

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default function DietTracker() {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(SHEET_API_URL)
      .then((res) => res.json())
      .then((rows) => {
        const mapped = {};
        rows.forEach((r) => {
          mapped[r.data] = {
            refeicao1: r.refeicao1 === 'TRUE',
            almoco: r.almoco === 'TRUE',
            lanche: r.lanche === 'TRUE',
            jantar: r.jantar === 'TRUE',
            exercicio: r.exercicio === 'TRUE',
          };
        });
        setData(mapped);
        setLoaded(true);
      });
  }, []);

  const handleCheck = (dayKey, field) => {
    const updated = {
      ...data,
      [dayKey]: {
        ...data[dayKey],
        [field]: !data?.[dayKey]?.[field],
      },
    };
    setData(updated);

    const payload = {
      data: dayKey,
      refeicao1: updated[dayKey].refeicao1,
      almoco: updated[dayKey].almoco,
      lanche: updated[dayKey].lanche,
      jantar: updated[dayKey].jantar,
      exercicio: updated[dayKey].exercicio,
    };

    fetch(SHEET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const daysCompleted = Object.values(data).filter(
    (d) => d.refeicao1 && d.almoco && d.lanche && d.jantar && d.exercicio
  ).length;
  const totalMarked = Object.values(data).filter((d) => Object.values(d).some(Boolean)).length;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dieta e Exercícios</h1>
      <Tabs defaultValue="checklist">
        <TabsList className="mb-4 flex gap-2">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="resumo">Resumo da Dieta</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <progress value={daysCompleted} max={days}></progress>
          <p className="text-sm">{daysCompleted} / {days} dias completos</p>
          <progress value={totalMarked} max={days}></progress>
          <p className="text-sm">{totalMarked} / {days} dias com algum progresso</p>

          {Array.from({ length: days }).map((_, i) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dayKey = formatDate(date);
            const d = data[dayKey] || {};
            return (
              <div key={i} className="border p-4 mt-4 rounded shadow">
                <h2 className="text-xl font-semibold">{dayKey}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['refeicao1', 'almoco', 'lanche', 'jantar', 'exercicio'].map((field) => (
                    <label key={field}>
                      <input
                        type="checkbox"
                        checked={!!d[field]}
                        onChange={() => handleCheck(dayKey, field)}
                      />{' '}
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="resumo">
          <div className="mt-4 border p-4 rounded shadow text-sm">
            <h2 className="text-xl font-semibold mb-2">Resumo da Dieta</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Refeição 1 (ao acordar): Banana + mel + gengibre em pó + Creatina</li>
              <li>Almoço: 150g carne magra + 100g arroz ou batata + vegetais + azeite e limão</li>
              <li>Lanche: Whey + fruta ou outras opções (ovo + maçã, iogurte + aveia, etc)</li>
              <li>Jantar: 150g carne magra + 200g batata doce ou mandioca + vegetais + azeite e limão</li>
              <li>Suplementos: Creatina (manhã), Chlorella (19h), Cromo (antes de dormir)</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
