import { createRef } from "react"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { DialogClose } from "@radix-ui/react-dialog"

export default function ModalHistory() {
  const canvasRef = createRef<HTMLCanvasElement>()

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="bg-muted/50">
        <CardTitle>Object Detection</CardTitle>
        <CardDescription>
          The image has been analyzed for objects.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <img
            src="https://fakeimg.pl/350x200/?text=Fake&font=lobster"
            alt="Selected Image"
            width={400}
            height={400}
            className="w-full h-64 object-cover rounded-lg"
            style={{ aspectRatio: "400/400", objectFit: "cover" }}
          />
          <div className="flex flex-col gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-lg font-medium mb-2">Objects Detected</h4>
              <ul className="space-y-2">
                <li>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-foreground rounded-full w-3 h-3" />
                    <span>Person</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary-foreground rounded-full w-3 h-3" />
                    <span>Chair</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted-foreground rounded-full w-3 h-3" />
                    <span>Table</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-lg font-medium mb-2">Confidence Scores</h4>
              <ul className="space-y-2">
                <li>
                  <div className="flex items-center justify-between">
                    <span>Person</span>
                    <span className="font-medium">0.92</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center justify-between">
                    <span>Chair</span>
                    <span className="font-medium">0.84</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center justify-between">
                    <span>Table</span>
                    <span className="font-medium">0.78</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </CardFooter>
    </Card>
  )
}
