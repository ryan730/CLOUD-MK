"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/SimpleMdeReact.tsx
var SimpleMdeReact_exports = {};
__export(SimpleMdeReact_exports, {
  SimpleMdeReact: () => SimpleMdeReact,
  default: () => SimpleMdeReact_default
});
module.exports = __toCommonJS(SimpleMdeReact_exports);
var import_react = __toESM(require("react"));
var import_easymde = __toESM(require("easymde"));
var _id = 0;
var generateId = () => `simplemde-editor-${++_id}`;
var useHandleEditorInstanceLifecycle = ({
  options,
  id,
  currentValueRef,
  textRef
}) => {
  const [editor, setEditor] = (0, import_react.useState)(null);
  const imageUploadCallback = (0, import_react.useCallback)(
    (file, onSuccess, onError) => {
      const imageUpload = options == null ? void 0 : options.imageUploadFunction;
      if (imageUpload) {
        const _onSuccess = (url) => {
          onSuccess(url);
        };
        imageUpload(file, _onSuccess, onError);
      }
    },
    [options == null ? void 0 : options.imageUploadFunction]
  );
  const editorRef = (0, import_react.useRef)(editor);
  editorRef.current = editor;
  (0, import_react.useEffect)(() => {
    let editor2;
    if (textRef) {
      const initialOptions = {
        element: textRef,
        initialValue: currentValueRef.current
      };
      const imageUploadFunction = (options == null ? void 0 : options.imageUploadFunction) ? imageUploadCallback : void 0;
      editor2 = new import_easymde.default(
        Object.assign({}, initialOptions, options, {
          imageUploadFunction
        })
      );
      setEditor(editor2);
    }
    return () => {
      editor2 == null ? void 0 : editor2.toTextArea();
      editor2 == null ? void 0 : editor2.cleanup();
    };
  }, [textRef, currentValueRef, id, imageUploadCallback, options]);
  const codemirror = (0, import_react.useMemo)(() => {
    return editor == null ? void 0 : editor.codemirror;
  }, [editor == null ? void 0 : editor.codemirror]);
  return { editor, codemirror };
};
var SimpleMdeReact = import_react.default.forwardRef((props, ref) => {
  const {
    events,
    value,
    options,
    children,
    extraKeys,
    getLineAndCursor,
    getMdeInstance,
    getCodemirrorInstance,
    onChange,
    id: anId,
    placeholder,
    textareaProps,
    ...rest
  } = props;
  const id = (0, import_react.useMemo)(() => anId ?? generateId(), [anId]);
  const elementWrapperRef = (0, import_react.useRef)(null);
  const nonEventChangeRef = (0, import_react.useRef)(true);
  const currentValueRef = (0, import_react.useRef)(value);
  currentValueRef.current = value;
  const [textRef, setTextRef] = (0, import_react.useState)(null);
  const { editor, codemirror } = useHandleEditorInstanceLifecycle({
    options,
    id,
    currentValueRef,
    textRef
  });
  (0, import_react.useEffect)(() => {
    if (nonEventChangeRef.current) {
      editor == null ? void 0 : editor.value(value ?? "");
    }
    nonEventChangeRef.current = true;
  }, [editor, value]);
  const onCodemirrorChangeHandler = (0, import_react.useCallback)(
    (_, changeObject) => {
      if ((editor == null ? void 0 : editor.value()) !== currentValueRef.current) {
        nonEventChangeRef.current = false;
        onChange == null ? void 0 : onChange((editor == null ? void 0 : editor.value()) ?? "", changeObject);
      }
    },
    [editor, onChange]
  );
  (0, import_react.useEffect)(() => {
    if (options == null ? void 0 : options.autofocus) {
      codemirror == null ? void 0 : codemirror.focus();
      codemirror == null ? void 0 : codemirror.setCursor(codemirror == null ? void 0 : codemirror.lineCount(), 0);
    }
  }, [codemirror, options == null ? void 0 : options.autofocus]);
  const getCursorCallback = (0, import_react.useCallback)(() => {
    codemirror && (getLineAndCursor == null ? void 0 : getLineAndCursor(codemirror.getDoc().getCursor()));
  }, [codemirror, getLineAndCursor]);
  (0, import_react.useEffect)(() => {
    getCursorCallback();
  }, [getCursorCallback]);
  (0, import_react.useEffect)(() => {
    editor && (getMdeInstance == null ? void 0 : getMdeInstance(editor));
  }, [editor, getMdeInstance]);
  (0, import_react.useEffect)(() => {
    codemirror && (getCodemirrorInstance == null ? void 0 : getCodemirrorInstance(codemirror));
  }, [codemirror, getCodemirrorInstance, getMdeInstance]);
  (0, import_react.useEffect)(() => {
    if (extraKeys && codemirror) {
      codemirror.setOption(
        "extraKeys",
        Object.assign({}, codemirror.getOption("extraKeys"), extraKeys)
      );
    }
  }, [codemirror, extraKeys]);
  (0, import_react.useEffect)(() => {
    var _a;
    const toolbarNode = (_a = elementWrapperRef.current) == null ? void 0 : _a.getElementsByClassName(
      "editor-toolbarNode"
    )[0];
    const handler = codemirror && onCodemirrorChangeHandler;
    if (handler) {
      toolbarNode == null ? void 0 : toolbarNode.addEventListener("click", handler);
      return () => {
        toolbarNode == null ? void 0 : toolbarNode.removeEventListener("click", handler);
      };
    }
    return () => {
    };
  }, [codemirror, onCodemirrorChangeHandler]);
  (0, import_react.useEffect)(() => {
    codemirror == null ? void 0 : codemirror.on("change", onCodemirrorChangeHandler);
    codemirror == null ? void 0 : codemirror.on("cursorActivity", getCursorCallback);
    return () => {
      codemirror == null ? void 0 : codemirror.off("change", onCodemirrorChangeHandler);
      codemirror == null ? void 0 : codemirror.off("cursorActivity", getCursorCallback);
    };
  }, [codemirror, getCursorCallback, onCodemirrorChangeHandler]);
  const prevEvents = (0, import_react.useRef)(events);
  (0, import_react.useEffect)(() => {
    const isNotFirstEffectRun = events !== prevEvents.current;
    isNotFirstEffectRun && prevEvents.current && Object.entries(prevEvents.current).forEach(([event, handler]) => {
      handler && (codemirror == null ? void 0 : codemirror.off(event, handler));
    });
    events && Object.entries(events).forEach(([event, handler]) => {
      handler && (codemirror == null ? void 0 : codemirror.on(event, handler));
    });
    prevEvents.current = events;
    return () => {
      events && Object.entries(events).forEach(([event, handler]) => {
        handler && (codemirror == null ? void 0 : codemirror.off(event, handler));
      });
    };
  }, [codemirror, events]);
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      id: `${id}-wrapper`,
      ...rest,
      ref: (aRef) => {
        if (typeof ref === "function") {
          ref(aRef);
        } else if (ref) {
          ref.current = aRef;
        }
        elementWrapperRef.current = aRef;
      }
    },
    /* @__PURE__ */ import_react.default.createElement(
      "textarea",
      {
        ...textareaProps,
        id,
        placeholder,
        ref: setTextRef,
        style: { display: "none" }
      }
    )
  );
});
SimpleMdeReact.displayName = "SimpleMdeReact";
var SimpleMdeReact_default = SimpleMdeReact;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SimpleMdeReact
});
