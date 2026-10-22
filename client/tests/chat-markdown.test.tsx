import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { ChatMarkdown } from "../src/components/common/ChatMarkdown";
import { ChatWidget } from "../src/components/common/ChatWidget";

it("renders rich replies including underline, nested lists, emoji, tables and code", () => {
  const { container } = render(
    <ChatMarkdown
      text={
        "**Đậm** và *nghiêng* và <u>gạch dưới</u> 🐿️\n\n- Bước một\n    - Ý nhỏ\n\n> Dừng một nhịp\n\n~~Bỏ qua~~\n\n| Mục | Giá |\n| --- | --- |\n| Bộ thẻ | 399.000đ |\n\n```js\nconst safe = true;\n```\n\n[Xem bộ trò chơi](/san-pham)"
      }
    />,
  );
  expect(container.querySelector("strong")?.textContent).toBe("Đậm");
  expect(container.querySelector("em")?.textContent).toBe("nghiêng");
  expect(container.querySelector("u")?.textContent).toBe("gạch dưới");
  expect(container.querySelector("ul ul li")?.textContent).toBe("Ý nhỏ");
  expect(container.querySelector("blockquote")?.textContent).toContain(
    "Dừng một nhịp",
  );
  expect(container.querySelector("del")?.textContent).toBe("Bỏ qua");
  expect(container.querySelector("table td")?.textContent).toBe("Bộ thẻ");
  expect(container.querySelector("pre code")?.textContent).toContain(
    "const safe = true;",
  );
  expect(container.textContent).toContain("🐿️");
  expect(screen.getByRole("link").getAttribute("rel")).toContain("noopener");
});

it("strips scripts, events, styles, embeds, external images and unsafe links", () => {
  const { container } = render(
    <ChatMarkdown
      text={
        '<script>alert(1)</script><iframe src="https://example.test"></iframe><img src="https://example.test/track" onerror="alert(1)"><u style="position:fixed" onclick="alert(1)">An toàn</u>\n\n[Link](javascript:alert%281%29)'
      }
    />,
  );
  expect(
    container.querySelector(
      "script, iframe, img, [onclick], [onerror], [style]",
    ),
  ).toBeNull();
  expect(container.querySelector("u")?.textContent).toBe("An toàn");
  expect(container.querySelector("a")?.getAttribute("href") ?? "").not.toMatch(
    /javascript:/i,
  );
});

it("keeps quota hidden until the API reports exhaustion and restores the mascot on close", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            message: "Hôm nay đã hết lượt AI. **Kết nối nhân viên** nhé!",
            handoff: true,
            remaining: 0,
          }),
          { status: 200 },
        ),
    ),
  );
  try {
    render(
      <MemoryRouter>
        <ChatWidget />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Mở chat với Sóc Thám Tử" }),
    );
    expect(screen.queryByText(/20 lượt/)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Mở chat với Sóc Thám Tử" }),
    ).toBeNull();
    fireEvent.change(screen.getByLabelText("Câu hỏi cho Sóc"), {
      target: { value: "Xin chào" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Gửi câu hỏi" }));
    await waitFor(() =>
      expect(
        screen.getByText("Kết nối nhân viên", { selector: "strong" }),
      ).toBeTruthy(),
    );
    expect(
      screen.getByRole("link", { name: "Kết nối nhân viên" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Đóng chat" }));
    expect(
      screen.getByRole("button", { name: "Mở chat với Sóc Thám Tử" }),
    ).toBeTruthy();
  } finally {
    vi.unstubAllGlobals();
  }
});
