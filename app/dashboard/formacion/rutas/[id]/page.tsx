import { FormacionBoard } from "@/components/formacion-board";

type RutaPageProps = {
  params: {
    id: string;
  };
};

export default function RutaPage({ params }: RutaPageProps) {
  return <FormacionBoard routeId={params.id} />;
}
