import {Element} from "./element";
import {ImageModel} from "./image.model";

export class QrCode extends ImageModel {

  link: string;

  public static override copy(source: QrCode, target: QrCode): void {
    Element.copy(source, target);
    target.data = source.data;
    target.link = source.link;
    target.imageFormat = source.imageFormat;
  }

  public static override clone(data: QrCode): QrCode {
    const instance: QrCode = new QrCode();
    this.copy(data, instance);
    return instance;
  }
}
