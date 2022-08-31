<template>
  <div class="relative leading-[normal]" :style="{ width: containerWidth }">
    <textarea :id="tinymceId" ref="targetRef" class="z-[-1] invisible" v-if="!initOptions.inline"></textarea>
    <slot v-else></slot>
  </div>
</template>

<script lang="ts" setup>
import type { Editor, RawEditorSettings } from "tinymce";
import tinymce from "tinymce/tinymce";
import "tinymce/themes/silver";
import "tinymce/icons/default/icons";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autosave";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/hr";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/noneditable";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/paste";
import "tinymce/plugins/preview";
import "tinymce/plugins/print";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/tabfocus";
import "tinymce/plugins/template";
import "tinymce/plugins/textpattern";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";

import {
  computed,
  nextTick,
  ref,
  unref,
  watch,
  onDeactivated,
  onBeforeUnmount,
  useAttrs,
} from "vue";
import { toolbar, plugins } from "./tinymce";
import { bindHandlers, isNumber } from "./helper";

interface IProps {
  options?: any;
  toolbar?: string[];
  plugins?: string[];
  modelValue?: string;
  height?: string | number;
  width?: string | number;
  showImageUpload?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  options: {},
  toolbar: () => toolbar,
  plugins: () => plugins,
  height: 400,
  width: "auto",
  showImageUpload: true,
});
const emit = defineEmits([
  "change",
  "update:modelValue",
  "inited",
  "init-error",
]);
const attrs = useAttrs();

const editorRef = ref<Editor>();
const targetRef = ref<HTMLElement>();
const tinymceId = ref("editor");
const containerWidth = computed(() => {
  const width = props.width;
  if (isNumber(width)) {
    return `${width}px`;
  }
  return width;
});

const langName = computed(() => "zh_CN");
const skinName = computed(() => "oxide");
const initOptions = computed((): RawEditorSettings => {
  const { height, options, toolbar, plugins } = props;

  const publicPath = '/'
  return {
    selector: `#${unref(tinymceId)}`,
    height,
    toolbar,
    menubar: "file edit insert view format table",
    plugins,
    language_url:
      publicPath + "resource/tinymce/langs/" + langName.value + ".js",
    language: langName.value,
    branding: false,
    default_link_target: "_blank",
    link_title: false,
    object_resizing: false,
    auto_focus: true,
    skin: skinName.value,
    skin_url: publicPath + "resource/tinymce/skins/ui/" + skinName.value,
    content_css:
      publicPath +
      "resource/tinymce/skins/ui/" +
      skinName.value +
      "/content.min.css",
    ...options,
    setup: (editor: Editor) => {
      editorRef.value = editor;
      editor.on("init", (e) => initSetup(e));
    },
  };
});

watch(
  () => attrs.disabled,
  () => {
    const editor = unref(editorRef);
    if (!editor) return;
    editor.setMode(attrs.disabled ? "readonly" : "design");
  }
);
nextTick(() => {
  setTimeout(() => {
    initEditor();
  }, 30);
});

onBeforeUnmount(() => {
  destory();
});

onDeactivated(() => {
  destory();
});

const destory = () => {
  if (tinymce !== null) {
    tinymce?.remove?.(unref(initOptions).selector!);
  }
};

// 初始化编辑器
const initEditor = () => {
  const el = unref(targetRef);
  if (el) {
    el.style.visibility = "";
  }
  tinymce
    .init(unref(initOptions))
    .then((editor) => {
      emit("inited", editor);
    })
    .catch((err) => {
      emit("init-error", err);
    });
};

// 初始化编辑器参数
const initSetup = (e: any) => {
  const editor = unref(editorRef);
  if (!editor) {
    return;
  }

  const value = props.modelValue || "";

  editor.setContent(value);
  bindModelHandlers(editor);
  bindHandlers(e, attrs, unref(editorRef));
};


// 给编辑器设置内容
const setValue = (editor: any, val: string, prevVal?: string) => {
  if (
    editor &&
    typeof val === "string" &&
    val !== prevVal &&
    val !== editor.getContent({ format: attrs.outputFormat })
  ) {
    editor.setContent(val);
  }
};

const bindModelHandlers = (editor: any) => {
  const modelEvents = attrs.modelEvents ? attrs.modelEvents : null;
  const normalizedEvents = Array.isArray(modelEvents)
    ? modelEvents.join(" ")
    : modelEvents;
  watch(
    () => props.modelValue,
    (val: string | undefined, prevVal: string | undefined) => {
      setValue(editor, val as string, prevVal);
    }
  );

  editor.on(
    normalizedEvents ? normalizedEvents : "change keyup undo redo",
    () => {
      const content = editor.getContent({ format: attrs.outputFormat });
      emit("update:modelValue", content);
      emit("change", content);
    }
  );
};

const getEditorContent = () => {
  if (editorRef.value) {
    return editorRef.value.getContent({ format: attrs.outputFormat as any });
  }
  return "";
};
// 只要把unocss 从0.45.5升到0.45.13就没问题了
const getUploadingImgName = (name: string) => `[fileUploading:${name}]`;
// const getUploadingImgName = (name: string) => '[fileUploading:' + name + ']';

const handleUploading = (name: string) => {
  const editor = unref(editorRef);
  if (!editor) return;
  editor.execCommand("mceInsertContent", false, getUploadingImgName(name));
  const content = editor?.getContent() ?? "";
  setValue(editor, content);
};

const handleUploaded = (name: string, url: string) => {
  const editor = editorRef.value;
  if (!editor) return;
  const content = editor?.getContent() ?? "";
  // 根据文件后缀名判断是否是图片
  const imgExtList = ["png", "jpg", "jpeg", "gif"];
  const ext = name.substring(name.lastIndexOf(".") + 1);
  const isImg = imgExtList.includes(ext);
  // 是图片就插入图片 不是图片就插入a标签
  const replaceContent = isImg
    ? `<img src="${url}"/>`
    : `<a href="${url}" target="__blank">${name}</a>`;
  const val = content?.replace(getUploadingImgName(name), replaceContent) ?? "";
  setValue(editor, val);
};

defineExpose({
  getEditorContent,
});
</script>

<style  scoped>
:deep(.tox-tinymce-aux) {
  z-index: 65537 !important;
}
</style>
