import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TemplateCards() {
  return (
    <div className="relative w-full h-auto flex flex-row flex-wrap items-center justify-center gap-4 sm:w-180 sm:h-120 sm:pt-20">
      <div className="w-full md:absolute sm:top-1/2 md:left-0 md:-translate-y-1/2 sm:w-auto">
        <Card className="w-full min-w-50 min-h-50 flex flex-col gap-4 max-w-7xl border-1 border-border rounded-lg py-4 sm:w-58">
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl font-bold text-chart-2">
                Usuários ativos
              </h2>
            </CardTitle>
          </CardHeader>
          <Separator className="w-full h-[1px] bg-border" />
          <CardContent>
            <span className="text-light text-xs text-center">
              Número de usuários ativos
            </span>
          </CardContent>
          <Separator className="w-full h-[1px] bg-border" />
          <CardFooter>
            <h1 className="font-bold text-center text-chart-2">
              5.000+ usuários ativos
            </h1>
          </CardFooter>
        </Card>
      </div>

      <div className="w-full md:absolute sm:top-0 md:right-1/2 md:translate-x-1/2 sm:w-auto ">
          <Card className="w-full min-w-50 min-h-50 flex flex-col gap-4 max-w-7xl border-1 border-border rounded-lg py-4 sm:w-58">
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl font-bold text-chart-2">
                Agendamentos hoje
              </h2>
            </CardTitle>
          </CardHeader>
          <Separator className="w-full h-[1px] bg-border" />
          <CardContent>
            <span className="text-xs text-center">
              Número de agendamentos realizados nas últimas 24 horas
            </span>
          </CardContent>
          <Separator className="w-full h-[1px] bg-border" />
          <CardFooter>
            <h1 className="font-bold text-center text-chart-2">
              342 agendamentos
            </h1>
          </CardFooter>
        </Card>
      </div>

      <div className="w-full md:absolute sm:top-1/2 md:right-0 md:-translate-y-1/2 sm:w-auto">
        <Card className="w-full min-w-50 min-h-50 flex flex-col gap-4 max-w-7xl border-1 border-border rounded-lg py-4 sm:w-58">
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl font-bold text-chart-2">
                Taxa de satisfação
              </h2>
              </CardTitle>
          </CardHeader>
          <Separator className="w-full h-[1px] bg-border" />
          <CardContent>
            <span className="text-xs text-center">
              Avaliação média dos nossos usuários
            </span>
          </CardContent>
          <Separator className="w-full h-[1px] bg-border" />
          <CardFooter>
            <h1 className="font-bold text-center text-chart-2">
              {" "}
              98% de satisfação
            </h1>
          </CardFooter>
        </Card>
      </div>

      <div className="w-full  md:absolute sm:bottom-0 md:right-1/2 md:translate-x-1/2 sm:w-auto">
        <Card className="w-full min-w-50 min-h-50 flex flex-col gap-4 max-w-7xl border-1 border-border rounded-lg py-4 sm:w-58">
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl font-bold text-chart-2">
                Tempo de resposta
              </h2>
            </CardTitle>
          </CardHeader>
          <Separator className="w-full h-[1px] bg-border" />
          <CardContent>
            <span className="text-xs text-center">
              Tempo médio para confirmar um agendamento
            </span>
            </CardContent>
          <Separator className="w-full h-[1px] bg-border" />
          <CardFooter>
            <h1 className="font-bold text-center text-chart-2">
              {" "}
              {"<"} de 2min de resposta
            </h1>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}