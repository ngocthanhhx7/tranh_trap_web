import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectSafetyTopics,
  safetyContext,
  SAFETY_SOURCE,
} from "../../src/services/safetyKnowledge.js";
import { buildChatPrompt } from "../../src/services/chatPrompt.js";

test("safety knowledge selects relevant, bounded topics with source pages", () => {
  assert.equal(
    selectSafetyTopics("Con bị bắt nạt, chê bai trong nhóm lớp")[0].id,
    "bullying",
  );
  assert.equal(
    selectSafetyTopics("Lua dao chuyen tien va link gia mao")[0].id,
    "scams",
  );
  assert.equal(selectSafetyTopics("Bộ Tránh Trap có giá bao nhiêu?").length, 0);
  const context = safetyContext("Thông tin cá nhân bị lộ mật khẩu");
  assert.match(context, /36, 49, 61/);
  assert.ok(context.includes(SAFETY_SOURCE.url));
  assert.ok(
    selectSafetyTopics("link mật khẩu bắt nạt livestream game tin giả")
      .length <= 3,
  );
});

test("the AI prompt separates source knowledge from instructions and product rules", () => {
  const prompt = buildChatPrompt(
    "Người lạ ép gửi ảnh riêng tư thì sao?",
    '{"price":399000}',
    "Ấm áp",
  );
  assert.match(prompt, /Dụ dỗ, ép gửi ảnh riêng tư/);
  assert.match(prompt, /trang 40, 60/);
  assert.match(prompt, /bản năm 2024/);
  assert.match(prompt, /Không tiết lộ mặt ngửa thẻ/);
  assert.match(prompt, /không chẩn đoán/);
  assert.match(prompt, /399000/);
});
