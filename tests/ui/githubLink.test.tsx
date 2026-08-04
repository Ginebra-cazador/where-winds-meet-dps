import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { GithubLink, GITHUB_REPO_URL } from "../../src/ui/layout/github-link/GithubLink"
import { I18nProvider } from "../../src/i18n/I18nContext"

describe("GithubLink", () => {
  it("points at the where-winds-meet-dps repository", () => {
    expect(GITHUB_REPO_URL).toBe("https://github.com/M1zuke/where-winds-meet-dps")
  })

  it("renders an accessible external link with a safe rel", () => {
    render(
      <I18nProvider>
        <GithubLink />
      </I18nProvider>,
    )
    const link = screen.getByRole("link", { name: /github/i })
    expect(link).toHaveAttribute("href", GITHUB_REPO_URL)
    expect(link).toHaveAttribute("target", "_blank")
    const rel = link.getAttribute("rel") ?? ""
    expect(rel).toContain("noopener")
    expect(rel).toContain("noreferrer")
  })

  it("shows the contribute note", () => {
    render(
      <I18nProvider>
        <GithubLink />
      </I18nProvider>,
    )
    expect(screen.getByText(/want to contribute/i)).toBeInTheDocument()
  })
})
