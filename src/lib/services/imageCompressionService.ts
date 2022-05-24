import sharp from "sharp";
// @ts-ignore
import isAnimated from "is-animated";
import { copyFileSync, readFileSync } from "fs";
import { extname } from "path";

export enum UsageType {
  ORIGINAL,
  SOCIAL,
  THUMB,
}

interface CompressArgs {
  inputFilePath: string;
  outputFilePath: string;
  usageType: UsageType;
}

export class ImageCompressionService {
  private static isAnimatedImage(filePath: string): boolean {
    return isAnimated(readFileSync(filePath));
  }

  private static isSVG(filePath: string): boolean {
    return extname(filePath) === ".svg";
  }

  async compressBanner({
    inputFilePath,
    usageType,
    outputFilePath,
  }: CompressArgs) {
    if (ImageCompressionService.isSVG(inputFilePath)) {
      // no compression at all
      const svgOutputPath = outputFilePath + ".svg";
      copyFileSync(inputFilePath, svgOutputPath);
      return Promise.resolve(svgOutputPath);
    }

    const webpOutputPath = outputFilePath + ".webp";
    // for social media
    if (usageType !== UsageType.ORIGINAL) {
      await sharp(inputFilePath)
        .resize({
          width: 800,
        })
        .webp({
          quality: 50,
        })
        .toFile(webpOutputPath);
    } else {
      const animated = ImageCompressionService.isAnimatedImage(inputFilePath);
      await sharp(inputFilePath, { animated })
        .resize({
          width: 1600,
        })
        .webp({
          quality: 70,
        })
        .toFile(webpOutputPath);
    }

    return webpOutputPath;
  }

  async compressNft({
    inputFilePath,
    usageType,
    outputFilePath,
  }: CompressArgs) {
    if (ImageCompressionService.isSVG(inputFilePath)) {
      const svgOutputPath = outputFilePath + ".svg";
      // no compression at all
      copyFileSync(inputFilePath, svgOutputPath);
      return Promise.resolve(svgOutputPath);
    }

    let imageOutputPath = outputFilePath + ".webp";
    switch (usageType) {
      case UsageType.SOCIAL:
        await sharp(inputFilePath)
          .resize({
            width: 480,
            withoutEnlargement: true,
          })
          .webp({
            quality: 50,
          })
          .toFile(imageOutputPath);
        break;
      case UsageType.THUMB:
        await sharp(inputFilePath, {
          animated: ImageCompressionService.isAnimatedImage(inputFilePath),
        })
          .resize({
            width: 480,
            withoutEnlargement: true,
          })
          .webp({
            quality: 50,
          })
          .toFile(imageOutputPath);
        break;
      case UsageType.ORIGINAL:
        // no compression at all
        imageOutputPath = outputFilePath + extname(inputFilePath);
        copyFileSync(inputFilePath, imageOutputPath);
    }

    return imageOutputPath;
  }
}

export const imageCompressionService = new ImageCompressionService();
