import Citation from "citation-js";
import readerModel from "$lib/models/readerModel";

// import asm from '/citation-templates/asm.csl';
// import cell from '/citation-templates/cell.csl';
// import chicago from '/citation-templates/chicago.csl';
// import mla from '/citation-templates/mla.csl';
// import nature from '/citation-templates/nature.csl';

export default class FormatterModel {
  fileExt = "";
  fileContents = "";
  citationStyle = "";
  formattedCitations = "";

  formatter = new Citation(readerModel.citations);
  // register = Citation.CSL.register.addTemplate;

  //***************************************************************************
  // Start boilerplate to make this a subscribable svelte store
  //***************************************************************************
  _subscription: Record<number, (arg0: FormatterModel) => void> = {};
  _subscriptionNum = 0;

  _dirty() {
    for (const subscription of Object.values(this._subscription)) {
      subscription(this);
    }
  }

  subscribe(subscription: (value: FormatterModel) => void): () => void {
    this._subscription[this._subscriptionNum] = subscription;
    subscription(this);
    return ((index) => {
      return () => {
        delete this._subscription[index];
      };
    })(this._subscriptionNum++);
  }
  //***************************************************************************
  // End boilerplate to make this a subscribable svelte store
  //***************************************************************************

  constructor() {
    // this.register("asm", "/citation-templates/asm.csl");
    // this.register("cell", "/citation-templates/cell.csl");
    // this.register("chicago", "/citation-templates/chicago.csl");
    // this.register("mla", "/citaion-templates/mla.csl");
    // this.register("nature", "/citation-templates/nature.csl");
    // this.register('asm', asm);
    // this.register('cell', cell);
    // this.register('chicago', chicago);
    // this.register('mla', mla);
    // this.register('nature', nature);
  }

  formatCitations(citationStyle: string) {
    console.log(citationStyle);
    if (citationStyle === "bib") {
      this.formattedCitations = this.formatter.format("bibtex");
      this.fileContents = this.formattedCitations;
      this.fileExt = citationStyle;
    } else if (citationStyle === "ris") {
      this.formattedCitations = this.formatter.format("ris");
      this.fileContents = this.formattedCitations;
      this.fileExt = citationStyle;
    } else {
      this.formattedCitations = this.formatter.format("bibliography", {
        format: "html",
        template: citationStyle,
        lang: "en-US"
      });

      this.fileContents = this.formatter.format("bibliography", {
        type: "string",
        template: citationStyle,
        lang: "en-US"
      });

      this.fileExt = `${citationStyle}.txt`;
    }

    this._dirty();
  }

  getDownload() {
    const blob = new Blob([this.fileContents], { type: "text/plain" })
    return URL.createObjectURL(blob);
  }
}