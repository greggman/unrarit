/*
 * unrar-adapter.cpp
 *
 * Thin C interface around the unrar Unpack class, compiled to WebAssembly
 * via Emscripten.  JavaScript calls these functions through cwrap() to
 * decompress individual RAR entries (both solid and non-solid archives).
 *
 * Build:  see Makefile.wasm
 */

#include "unrar/rar.hpp"

// ─── Context ──────────────────────────────────────────────────────────────────

struct RarContext {
  ComprDataIO dataIO;
  Unpack*     unpack;
  uint64      lastWinSize;
  bool        initialized;

  RarContext() : unpack(nullptr), lastWinSize(0), initialized(false) {}
  ~RarContext() { delete unpack; }
};

// ─── Exported C API ───────────────────────────────────────────────────────────

extern "C" {

/*
 * Allocate a new decompression context.
 * Returns an opaque pointer (cast to JS number via Emscripten).
 */
void* rar_alloc_context() {
  return new RarContext();
}

/*
 * Free a previously allocated context.
 */
void rar_free_context(void* ctxPtr) {
  delete static_cast<RarContext*>(ctxPtr);
}

/*
 * Decompress one entry.
 *
 * Parameters
 * ----------
 * ctxPtr      Opaque context from rar_alloc_context().
 * version     Unpack algorithm version: 15, 20, 29 (RAR4) or 50, 70 (RAR5).
 * winSize     Sliding window size in bytes (e.g. 0x100000 = 1 MB).
 *             Ignored when version == 50 or 70 (RAR5 manages its own window).
 * inPtr       Compressed data buffer.
 * inSize      Number of compressed bytes.
 * outPtr      Pre-allocated output buffer (caller's responsibility).
 * outSize     Expected number of decompressed bytes.
 * isSolid     1 if this entry belongs to a solid stream; 0 otherwise.
 * isFirst     1 if this is the first entry in a solid stream (or a non-solid
 *             entry); 0 to continue decompressing a solid stream.
 *
 * Returns 0 on success, non-zero on failure.
 */
int rar_decompress(
    void*    ctxPtr,
    uint32_t version,
    uint32_t winSize,   // WASM is 32-bit; uint64_t would break cwrap alignment
    uint8_t* inPtr,  size_t inSize,
    uint8_t* outPtr, size_t outSize,
    int      isSolid,
    int      isFirst)
{
  RarContext* ctx = static_cast<RarContext*>(ctxPtr);

  const bool solid = isSolid != 0;

  try {
    // (Re)initialise the unpacker when:
    //   • this is the first call, or
    //   • it's a non-solid entry (fresh context every time), or
    //   • the window size has changed (uncommon but possible in solid streams).
    if (!ctx->initialized || !solid || winSize != ctx->lastWinSize) {
      delete ctx->unpack;
      ctx->unpack = nullptr;
      ctx->dataIO.Init();
      ctx->unpack = new Unpack(&ctx->dataIO);
      ctx->unpack->Init(winSize, solid);
      ctx->lastWinSize = winSize;
      ctx->initialized = true;
    }

    ctx->unpack->SetDestSize(static_cast<int64>(outSize));
    ctx->dataIO.SetUnpackFromMemory(inPtr,  inSize);
    ctx->dataIO.SetPackedSizeToRead(static_cast<int64>(inSize));
    ctx->dataIO.SetUnpackToMemory(outPtr, static_cast<uint>(outSize));

    ctx->unpack->DoUnpack(version, solid);
  } catch (RAR_EXIT code) {
    return -(int(code) + 10);  // encode exit code: RARX_SUCCESS=0 → -10
  } catch (std::bad_alloc&) {
    return -100;
  } catch (...) {
    return -1;
  }

  return 0;
}

} // extern "C"
