// Original, provisional code-drawn AZMARA monogram. Run from mobile/.
// Rendering generates only the scaffold's AppIcon PNGs listed in Contents.json.
import AppKit
import Foundation
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let directory = root.appendingPathComponent("ios/Runner/Assets.xcassets/AppIcon.appiconset")
let catalog = try JSONSerialization.jsonObject(with: Data(contentsOf:
  directory.appendingPathComponent("Contents.json"))) as! [String: Any]
var rendered = Set<String>()
for item in catalog["images"] as! [[String: Any]] {
  let filename = item["filename"] as! String
  if rendered.contains(filename) { continue }
  rendered.insert(filename)
  let points = Double((item["size"] as! String).split(separator: "x")[0])!
  let scale = Double((item["scale"] as! String).dropLast())!
  let pixels = Int(points * scale)
  let canvas = CGContext(data: nil, width: pixels, height: pixels,
    bitsPerComponent: 8, bytesPerRow: pixels * 4, space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
  let context = NSGraphicsContext(cgContext: canvas, flipped: false)
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = context
  let factor = CGFloat(pixels) / 1024
  context.cgContext.scaleBy(x: factor, y: factor)
  NSColor(red: 0.16, green: 0.23, blue: 0.20, alpha: 1).setFill()
  NSRect(x: 0, y: 0, width: 1024, height: 1024).fill()
  NSColor(red: 0.82, green: 0.68, blue: 0.40, alpha: 1).setStroke()
  let diamond = NSBezierPath()
  diamond.move(to: NSPoint(x: 512, y: 935))
  diamond.line(to: NSPoint(x: 915, y: 512))
  diamond.line(to: NSPoint(x: 512, y: 89))
  diamond.line(to: NSPoint(x: 109, y: 512))
  diamond.close()
  diamond.lineWidth = 14
  diamond.stroke()
  let text = "A" as NSString
  let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont(name: "Georgia-Bold", size: 600) ?? NSFont.boldSystemFont(ofSize: 600),
    .foregroundColor: NSColor(red: 0.96, green: 0.91, blue: 0.76, alpha: 1),
  ]
  let size = text.size(withAttributes: attributes)
  text.draw(at: NSPoint(x: (1024 - size.width) / 2,
                       y: (1024 - size.height) / 2 + 25), withAttributes: attributes)
  NSGraphicsContext.restoreGraphicsState()
  let destination = CGImageDestinationCreateWithURL(
    directory.appendingPathComponent(filename) as CFURL, UTType.png.identifier as CFString,
    1, nil)!
  CGImageDestinationAddImage(destination, canvas.makeImage()!, nil)
  guard CGImageDestinationFinalize(destination) else { fatalError("PNG encoding failed") }
}
print("Rendered \(rendered.count) opaque original AZMARA monogram icons.")
