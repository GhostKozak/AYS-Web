import { render, screen } from "../../utils/test-utils";
import DiffViewer from "./DiffViewer";

describe("DiffViewer Component", () => {
  it("diffs boşsa hiçbir şey render etmemeli", () => {
    const { container } = render(<DiffViewer diffs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("değişiklikleri doğru göstermeli", () => {
    // DiffChange tipine uygun mock verisi
    const mockDiffs = [
      { key: "Ad", oldValue: "Ahmet", newValue: "Mehmet" },
      { key: "Unvan", oldValue: "Şoför", newValue: "Yönetici" },
    ];

    render(<DiffViewer diffs={mockDiffs} />);

    // Ekranda hem eski hem yeni değerler olmalı
    expect(screen.getByText("Ahmet")).toBeInTheDocument();
    expect(screen.getByText("Mehmet")).toBeInTheDocument();

    // Key (başlık) görünmeli
    expect(screen.getByText("Ad")).toBeInTheDocument();
  });

  it('boş değerleri (null/undefined) "(Boş)" olarak göstermeli', () => {
    const mockDiffs = [
      { key: "Telefon", oldValue: null, newValue: "555-1234" },
    ];

    render(<DiffViewer diffs={mockDiffs} />);

    // oldValue null olduğu için "(Boş)" yazmalı.
    // Not: Kodunda <em ...>(Boş)</em> var, parantezli regex ile arıyoruz.
    const emptyLabels = screen.getAllByText(/\(Boş\)/i);
    expect(emptyLabels.length).toBeGreaterThan(0);

    expect(screen.getByText("555-1234")).toBeInTheDocument();
  });
});
