# V0-Vercel AI component Display Picture

```jsx
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/yju8BVgn6GQ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Picture History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-background rounded-lg overflow-hidden cursor-pointer group"
            onClick={() =>
              handleImageClick(`/placeholder.svg?height=400&width=400`)
            }>
            <img
              src="/placeholder.svg"
              alt={`Picture ${i + 1}`}
              width="400"
              height="400"
              className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity"
              style={{ aspectRatio: "400/400", objectFit: "cover" }}
            />
            <div className="p-4">
              <h3 className="text-lg font-medium mb-1">Picture {i + 1}</h3>
              <p className="text-muted-foreground text-sm">
                Uploaded on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="w-full max-w-2xl">
          <div>
            <div>Object Detection</div>
            <div>The image has been analyzed for objects.</div>
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img
                src="/placeholder.svg"
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
                  <h4 className="text-lg font-medium mb-2">
                    Confidence Scores
                  </h4>
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
          </div>
          <div>
            <Button variant="outline" onClick={handleModalClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```
