/**
 * Copyright (c) 2018-present, Ephox, Inc.
 *
 * This source code is licensed under the Apache 2 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options';
import { CreateElement, Vue } from 'vue/types/vue';

// import * as ScriptLoader from '../ScriptLoader';
// import { getTinymce } from '../TinyMCE';
import { initEditor, isTextarea, mergePlugins, uuid } from '../Utils';
import { editorProps, IPropTypes } from './EditorPropTypes';

import 'tinymce/tinymce';

// Any plugins you want to use has to be imported
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/bbcode';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/fullpage';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/legacyoutput';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/noneditable';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/print';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/save';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/spellchecker';
import 'tinymce/plugins/tabfocus';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/textpattern';
import 'tinymce/plugins/toc';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';

// const scriptState = ScriptLoader.create();

declare module 'vue/types/vue' {
  interface Vue {
    elementId: string;
    element: Element | null;
    editor: any;
    inlineEditor: boolean;
  }
}
declare global {
  interface Window {
    tinyMCE: {
      init: (option: object) => void;
      remove: (editor: object) => void;
    };
  }
}

export interface IEditor extends Vue {
  $props: Partial<IPropTypes>;
}

const renderInline = (h: CreateElement, id: string, tagName?: string) => {
  return h(tagName ? tagName : 'div', {
    attrs: { id }
  });
};

const renderIframe = (h: CreateElement, id: string) => {
  return h('textarea', {
    attrs: { id },
    style: { visibility: 'hidden' }
  });
};

const initialise = (ctx: IEditor) => () => {
  const finalInit = {
    ...ctx.$props.init,
    readonly: ctx.$props.disabled,
    selector: `#${ctx.elementId}`,
    plugins: mergePlugins(ctx.$props.init && ctx.$props.init.plugins, ctx.$props.plugins),
    toolbar: ctx.$props.toolbar || (ctx.$props.init && ctx.$props.init.toolbar),
    inline: ctx.inlineEditor,
    setup: (editor: any) => {
      ctx.editor = editor;
      editor.on('init', (e: Event) => initEditor(e, ctx, editor));

      if (ctx.$props.init && typeof ctx.$props.init.setup === 'function') {
        ctx.$props.init.setup(editor);
      }
    }
  };

  if (isTextarea(ctx.element)) {
    ctx.element.style.visibility = '';
  }

  window.tinyMCE.init(finalInit);
  // getTinymce().init(finalInit);
};

export const Editor: ThisTypedComponentOptionsWithRecordProps<Vue, {}, {}, {}, IPropTypes> = {
  props: editorProps,
  created() {
    this.elementId = this.$props.id || uuid('tiny-vue');
    this.inlineEditor = (this.$props.init && this.$props.init.inline) || this.$props.inline;
  },
  watch: {
    disabled() {
      (this as any).editor.setMode(this.disabled ? 'readonly' : 'design');
    }
  },
  mounted() {
    this.element = this.$el;

    initialise(this)();
    // if (getTinymce() !== null) {
    //   initialise(this)();
    // } else if (this.element && this.element.ownerDocument) {
    //   const doc = this.element.ownerDocument;
    //   const channel = this.$props.cloudChannel ? this.$props.cloudChannel : '5';
    //   const apiKey = this.$props.apiKey ? this.$props.apiKey : '';
    //   const url = `https://cloud.tinymce.com/${channel}/tinymce.min.js?apiKey=${apiKey}`;

    //   ScriptLoader.load(scriptState, doc, url, initialise(this));
    // }
  },
  beforeDestroy() {
    if (window.tinyMCE !== null) {
      window.tinyMCE.remove(this.editor);
    }
  },
  render(h: any) {
    return this.inlineEditor ? renderInline(h, this.elementId, this.$props.tagName) : renderIframe(h, this.elementId);
  }
};
