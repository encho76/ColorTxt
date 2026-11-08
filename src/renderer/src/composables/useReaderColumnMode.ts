/**
 * 双栏阅读（主界面 / 找书窗口共享的显示偏好）。
 *
 * 设计取舍：这是纯本地显示开关，独立于 `constants/appUi.ts` 的
 * `colorTxt.ui.settings` 主配置包：
 * - 不进入设置面板的 draft/apply 事务，切换即时生效；
 * - 不进入 WebDAV 配置同步；
 * - 避免改动主配置解析/写入链路（该文件被多个窗口共用），降低回归面。
 * 跨窗口同步走 localStorage 的 `storage` 事件（同源多渲染进程）。
 */
import { ref } from "vue";

const READER_DUAL_COLUMN_KEY = "colorTxt.ui.readerDualColumn";

function readPersistedDualColumn(): boolean {
  try {
    return window.localStorage.getItem(READER_DUAL_COLUMN_KEY) === "1";
  } catch {
    // 存储不可用时保持单栏，不影响正常阅读
    return false;
  }
}

/** 全局单例：所有引用方（工具栏、设置面板、阅读器）共享同一状态 */
export const readerDualColumn = ref(false);

if (typeof window !== "undefined") {
  readerDualColumn.value = readPersistedDualColumn();
  window.addEventListener("storage", (event) => {
    if (event.key !== READER_DUAL_COLUMN_KEY) return;
    readerDualColumn.value = readPersistedDualColumn();
  });
}

export function setReaderDualColumn(enabled: boolean): void {
  const next = enabled === true;
  try {
    window.localStorage.setItem(READER_DUAL_COLUMN_KEY, next ? "1" : "0");
  } catch (error) {
    // 不静默吞错：持久化失败要可见，但本次会话内仍允许切换
    console.warn("[ColorTxt] 双栏阅读设置无法写入 localStorage", error);
  }
  readerDualColumn.value = next;
}

export function toggleReaderDualColumn(): void {
  setReaderDualColumn(!readerDualColumn.value);
}
