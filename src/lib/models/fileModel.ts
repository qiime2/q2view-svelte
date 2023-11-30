export default class FileModel {
  file: File | Blob | null = null;

  _subscription: Record<number, (arg0: FileModel) => void> = {};
  _subscriptionNum = 0;

  _dirty() {
    for (const subscription of Object.values(this._subscription)) {
      subscription(this);
    }
  }

  subscribe(subscription: (value: FileModel) => void): () => void {
    this._subscription[this._subscriptionNum] = subscription;
    subscription(this);
    return ((index) => {
      return () => {
        delete this._subscription[index];
      };
    })(this._subscriptionNum++);
  }

  setFile(file: File | Blob) {
    this.file = file;
    this._dirty();
  }
}
