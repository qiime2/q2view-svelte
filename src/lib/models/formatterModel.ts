import Cite from "citation-js";

import asmTemplate from "$lib/citation-templates/asm";
import cellTemplate from "$lib/citation-templates/cell";
import chicagoTemplate from "$lib/citation-templates/chicago";
import mlaTemplate from "$lib/citation-templates/mla";
import natureTemplate from "$lib/citation-templates/nature";

export default class FormatterModel {
  fileExt = "";
  fileContents = "";
  citationStyle = "";
  downloadableFile = "";
  formattedCitations = "";

  formatter = new Cite();
  register = Cite.CSL.register.addTemplate;

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
    this.register("asm", asmTemplate);
    this.register("cell", cellTemplate);
    this.register("chicago", chicagoTemplate);
    this.register("mla", mlaTemplate);
    this.register("nature", natureTemplate);
  }

  setFormatter(citations: string) {
    this.formatter = new Cite(citations);
  }

  formatCitations(citationStyle: string) {
    if (citationStyle === "bib") {
      this.formattedCitations = this.formatter.format("bibtex");
      this.fileContents = this.formattedCitations;
      this.fileExt = citationStyle;
    } else if (citationStyle === "ris") {
      this.formattedCitations = this.formatter.format(`${citationStyle}`);
      this.fileContents = this.formattedCitations;
      this.fileExt = citationStyle;
    } else {
      this.formattedCitations = this.formatter.format("bibliography", {
        type: "json",
        template: citationStyle,
      });

      this.fileContents = this.formatter.format("bibliography", {
        type: "string",
        template: citationStyle,
        lang: "en-US",
      });

      this.fileExt = `${citationStyle}.txt`;
    }

    this.downloadableFile = this._getDownload();
    this._dirty();
  }

  _getDownload() {
    const blob = new Blob([this.fileContents], { type: "text/plain" });
    return URL.createObjectURL(blob);
  }
}
