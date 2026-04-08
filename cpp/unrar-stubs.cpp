/*
 * unrar-stubs.cpp
 *
 * Stub implementations of unrar library symbols that are not needed for
 * our WebAssembly decompressor (no UI, no file I/O, no volume merging,
 * no large-page allocation).
 */

#include "unrar/rar.hpp"

// ─── Global ErrHandler instance (declared extern in global.hpp) ───────────────
// The INCLUDEGLOBAL guard in global.hpp emits the definition when set.
// We define it here instead.
ErrorHandler ErrHandler;

// ─── LargePageAlloc ───────────────────────────────────────────────────────────
// We never use large pages in WASM, so all methods are no-ops / stubs.

LargePageAlloc::LargePageAlloc() : UseLargePages(false) {}

void LargePageAlloc::AllowLargePages(bool /*Allow*/) {}

void* LargePageAlloc::new_large(size_t /*Size*/) {
  return nullptr;  // causes new_l<T> to fall back to regular new T[]
}

bool LargePageAlloc::delete_large(void* /*Addr*/) {
  return false;  // causes delete_l<T> to fall back to regular delete[]
}

bool LargePageAlloc::IsPrivilegeAssigned() { return false; }
bool LargePageAlloc::AssignPrivilege()     { return false; }
bool LargePageAlloc::AssignPrivilegeBySid(const std::wstring& /*Sid*/) { return false; }
bool LargePageAlloc::AssignConfirmation()  { return false; }

// ─── UI callbacks (no-ops) ────────────────────────────────────────────────────

void uiAlarm(UIALARM_TYPE /*Type*/) {}

void uiExtractProgress(int64 /*CurFileSize*/, int64 /*TotalFileSize*/,
                       int64 /*CurSize*/,     int64 /*TotalSize*/) {}

void uiMsgStore::Msg() {}

// ─── Volume merging (not supported) ──────────────────────────────────────────

bool MergeArchive(Archive& /*Arc*/, ComprDataIO* /*DataIO*/,
                  bool /*ShowFileName*/, wchar /*Command*/) {
  return false;
}

// ─── Miscellaneous ────────────────────────────────────────────────────────────

// ToPercent: used for progress display; return 0 to satisfy the linker.
int ToPercent(int64 /*N1*/, int64 /*N2*/) { return 0; }

// Wait: platform sleep/yield; no-op in WASM.
void Wait() {}

// File::Write: we never write output files; return false (failure) if called.
bool File::Write(const void* /*Data*/, size_t /*Size*/) { return false; }

// cleandata: secure-zero a buffer (used by crypto destructors).
// memset is sufficient here; the compiler won't optimise it away at link time.
void cleandata(void* data, size_t size) {
  volatile unsigned char* p = reinterpret_cast<volatile unsigned char*>(data);
  while (size--) *p++ = 0;
}
