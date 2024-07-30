import { Progress } from "./ui/progress"
import { BlurIn } from "./ui/text-blur"
import { Card, CardContent, CardHeader } from "./ui/card"
import { ModelList } from "@/models/model-list"

interface IProps {
  percent?: number
  model?: ModelList
}
export default function ModelLoader({ percent, model }: IProps) {
  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <BlurIn balise="h3" text={model.title} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full text-center flex flex-col justify-center items-center">
          <Progress value={percent} />
          <BlurIn balise="p" text={`${percent} %`} />
          <BlurIn balise="p" text={model.description} />
        </div>
      </CardContent>
    </Card>
  )
}
