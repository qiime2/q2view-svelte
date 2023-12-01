export default class DataReaderModel {
  name: string = "";
  data: File | Blob | null = null;

  //****************************************************************************
  // Start Boilerplate to make this a subscribable svelte store
  //****************************************************************************
  _subscription: Record<number, (arg0: DataReaderModel) => void> = {};
  _subscriptionNum = 0;

  _dirty() {
    for (const subscription of Object.values(this._subscription)) {
      subscription(this);
    }
  }

  subscribe(subscription: (value: DataReaderModel) => void): () => void {
    this._subscription[this._subscriptionNum] = subscription;
    subscription(this);
    return ((index) => {
      return () => {
        delete this._subscription[index];
      };
    })(this._subscriptionNum++);
  }
  //****************************************************************************
  // End Boilerplate to make this a subscribable svelte store
  //****************************************************************************

  private async getRemoteFile(url: string): Promise<Blob> {
    return await fetch(url).then((response) => {
      if (!response.ok) {
        throw Error(`Network error, recieved ${response.status} from server.`);
      }

      return response.blob();
    })
  }

  async readData(rawSrc: File | string, sourceType: string): Promise<void> {
    // They gave us a file from their computer
    if (rawSrc instanceof File) {
      this.data = rawSrc;
      this.name = rawSrc.name;
    }
    // They gave us some kind of URL
    else {
      // Handle potential DropBox URL weirdness to do with search params
      if (sourceType === "DropBoxURL") {
        const source = new URL(rawSrc);
        source.searchParams.set('dl', '1');
        const path = `${source.pathname}?${source.searchParams}`;
        rawSrc = `https://dl.dropboxusercontent.com${path}`;
      }

      this.data = await this.getRemoteFile(rawSrc);
      this.name = this.parseFileNameFromURL(rawSrc);
    }

    this._dirty();
  }

  private parseFileNameFromURL(url: string): string {
    let fileName = new URL(url).pathname.split("/").pop();

    if (fileName === undefined) {
      throw Error(`Could not get filename from the URL ${url}`);
    }

    return fileName;
  }
}
