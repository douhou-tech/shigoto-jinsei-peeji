"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react"
import BackgroundShader from "./background";
import Amoeba from "./amoeba";

const aboutKeywords = ["computation", "organic", "development", "amoeboid", "fluid adaptability", "first principles", "zero-bloat", "shapeless logic", "robust systems"]
const aboutText = "Computation is organic, and my development style reflects that. Guided by an amoeboid philosophy, I avoid rigid templates in favor of fluid adaptability. I start from first principles the bare metal and build upward through the vertical stack. By understanding how data behaves at the lowest levels, I can mold custom structures that expand and contract as requirements shift. It is a philosophy of zero-bloat, rapid assimilation, and elegant, self-directed growth from shapeless logic to robust systems.";

const aboutKeywordStyles = [styles.keywordSpan, styles.keywordSpan2, styles.keywordSpan3];

const randomInt = (n) => {
  return Math.floor(Math.random() * n);
};

const githubBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktZ2l0aHViIiB2aWV3Qm94PSIwIDAgMTYgMTYiPgogIDxwYXRoIGQ9Ik04IDBDMy41OCAwIDAgMy41OCAwIDhjMCAzLjU0IDIuMjkgNi41MyA1LjQ3IDcuNTkuNC4wNy41NS0uMTcuNTUtLjM4IDAtLjE5LS4wMS0uODItLjAxLTEuNDktMi4wMS4zNy0yLjUzLS40OS0yLjY5LS45NC0uMDktLjIzLS40OC0uOTQtLjgyLTEuMTMtLjI4LS4xNS0uNjgtLjUyLS4wMS0uNTMuNjMtLjAxIDEuMDguNTggMS4yMy44Mi43MiAxLjIxIDEuODcuODcgMi4zMy42Ni4wNy0uNTIuMjgtLjg3LjUxLTEuMDctMS43OC0uMi0zLjY0LS44OS0zLjY0LTMuOTUgMC0uODcuMzEtMS41OS44Mi0yLjE1LS4wOC0uMi0uMzYtMS4wMi4wOC0yLjEyIDAgMCAuNjctLjIxIDIuMi44Mi42NC0uMTggMS4zMi0uMjcgMi0uMjdzMS4zNi4wOSAyIC4yN2MxLjUzLTEuMDQgMi4yLS44MiAyLjItLjgyLjQ0IDEuMS4xNiAxLjkyLjA4IDIuMTIuNTEuNTYuODIgMS4yNy44MiAyLjE1IDAgMy4wNy0xLjg3IDMuNzUtMy42NSAzLjk1LjI5LjI1LjU0LjczLjU0IDEuNDggMCAxLjA3LS4wMSAxLjkzLS4wMSAyLjIgMCAuMjEuMTUuNDYuNTUuMzhBOC4wMSA4LjAxIDAgMCAwIDE2IDhjMC00LjQyLTMuNTgtOC04LTgiLz4KPC9zdmc+" 
const linkedInBase64 = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4NDAgNzc5IiB3aWR0aD0iODQwIiBoZWlnaHQ9Ijc3OSI+CjxwYXRoIGQ9Ik01MS4xNiAwLjE3QzI3Ny4wNSAwLjE3IDUwMi45NSAwLjE3IDcyOC44NCAwLjE3QzczMy4yMyAxLjk4IDczOC42NSAyLjM4IDc0My4zMSA0LjIxQzc1Mi43NyA3LjkzIDc2MS4wOCAxNC4xOCA3NjcuNDYgMjIuMDdDNzgwLjU1IDM4LjI2IDc3OS41IDU3Ljg1IDc3OS41IDc3LjVDNzc5LjUgMTA1LjgzIDc3OS41IDEzNC4xNyA3NzkuNSAxNjIuNUM3NzkuNSAzMTEuNSA3NzkuNSA0NjAuNSA3NzkuNSA2MDkuNUM3NzkuNSA2MzkuNSA3NzkuNSA2NjkuNSA3NzkuNSA2OTkuNUM3NzkuNSA3MTkuNiA3ODAuODkgNzM5LjU2IDc2Ny45MyA3NTYuMzhDNzYxLjI0IDc2NS4wOCA3NTEuNjEgNzcyLjE1IDc0MS4xOSA3NzUuNjJDNzM3LjE5IDc3Ni45NSA3MzIuNTYgNzc3LjM2IDcyOC44NCA3NzguODNDNTAyLjk1IDc3OC44MyAyNzcuMDUgNzc4LjgzIDUxLjE2IDc3OC44M0M0Ny40MSA3NzcuMzUgNDIuNzggNzc3LjA1IDM4Ljc4IDc3NS42NkMyOC41NSA3NzIuMTIgMTkuMjYgNzY1LjM5IDEyLjU1IDc1Ni45MkMtMS4wNyA3MzkuNzQgMC44MyA3MjEuMTEgMC44MyA3MDAuNUMwLjgzIDY3MC4xNyAwLjgzIDYzOS44MyAwLjgzIDYwOS41QzAuODMgNDYwLjE3IDAuODMgMzEwLjgzIDAuODMgMTYxLjVDMC44MyAxMzMuMTcgMC44MyAxMDQuODMgMC44MyA3Ni41QzAuODMgNTYuNSAtMC43IDM4LjY4IDEyLjU1IDIyLjA4QzE4Ljg3IDE0LjE1IDI3LjI2IDcuOTIgMzYuNjkgNC4yMUM0MS4zNSAyLjM4IDQ2Ljc4IDEuOTggNTEuMTYgMC4xN1pNMTYzLjY5IDEwOC4zNkMxNTUuMjYgMTA5LjY4IDE0Ni45NCAxMTIuNjggMTM5LjY1IDExNy4xNEM5MC43NCAxNDcuMSA5OS4yNSAyMjEuMTcgMTU0LjM0IDIzOC4yNEMxNjMuMyAyNDEuMDEgMTczLjExIDI0MS45OSAxODIuNDQgMjQwLjc0QzE5MS4zIDIzOS41NSAxOTkuODcgMjM2LjU2IDIwNy42MSAyMzIuMDdDMjE0LjUxIDIyOC4wNyAyMjAuOTIgMjIyLjYxIDIyNS45MSAyMTYuMzdDMjU2LjQ3IDE3OC4wOSAyMzcuMjEgMTIyLjUzIDE5MC42MiAxMDkuNzZDMTgxLjk5IDEwNy4zOSAxNzIuNTMgMTA2Ljk3IDE2My42OSAxMDguMzZaTTY2My41IDY2My41QzY2NS40NyA2NTEuNjkgNjY0IDYzOC41MSA2NjQgNjI2LjVDNjY0IDYwMi41IDY2NCA1NzguNSA2NjQgNTU0LjVDNjY0IDUzNy4xNyA2NjQgNTE5LjgzIDY2NCA1MDIuNUM2NjQgNDkwLjgzIDY2NCA0NzkuMTcgNjY0IDQ2Ny41QzY2NCA0MTIuMiA2NjEuODYgMzQxLjAyIDYxMS45IDMwNS41N0M2MDMuOCAyOTkuODIgNTk0Ljc4IDI5NS40NiA1ODUuNDcgMjkyLjA1QzU3My40MyAyODcuNjUgNTYwLjI3IDI4NC45NSA1NDcuNSAyODQuMDJDNTMwLjA0IDI4Mi43NCA1MTIuNzYgMjgyLjQzIDQ5NS41NCAyODYuMTZDNDczLjA0IDI5MS4wNCA0NTIuMDUgMzAxLjk3IDQzNS40NiAzMTcuOTZDNDMwLjcxIDMyMi41NSA0MjYuMzQgMzI3LjY4IDQyMi41NyAzMzMuMUM0MjAuMSAzMzYuNjYgNDE4LjQ4IDM0MS4wMyA0MTQuODQgMzQzQzQxNC44NCAzMjYuMDYgNDE0Ljg0IDMwOS4xMiA0MTQuODQgMjkyLjE4QzM3Ny45NSAyOTIuMTggMzQxLjA2IDI5Mi4xOCAzMDQuMTcgMjkyLjE4QzMwNC4xNyA0MTUuOTUgMzA0LjE3IDUzOS43MiAzMDQuMTcgNjYzLjQ5QzM0Mi4yOCA2NjMuNDkgMzgwLjM5IDY2My40OSA0MTguNSA2NjMuNDlDNDE5Ljk4IDY1Ni44NSA0MTkuMTYgNjQ5LjM2IDQxOS4xNiA2NDIuNUM0MTkuMTYgNjI5LjgzIDQxOS4xNiA2MTcuMTcgNDE5LjE2IDYwNC41QzQxOS4xNiA1NzUuODMgNDE5LjE2IDU0Ny4xNyA0MTkuMTYgNTE4LjVDNDE5LjE2IDUwMC41MiA0MTguNjQgNDgyLjQzIDQxOS44MiA0NjQuNUM0MjEuOTMgNDMyLjQ5IDQyOS4yOSAzOTcuMjIgNDY0Ljc3IDM4Ny4zNUM0NzIuMzkgMzg1LjIzIDQ4MC42IDM4NC4yMiA0ODguNSAzODQuMTZDNDk0LjY3IDM4NC4xMiA1MDEuMTIgMzg0Ljk3IDUwNy4xIDM4Ni40NUM1NDAuMSAzOTQuNjUgNTQ2LjEgNDI3LjI4IDU0OC4yOSA0NTYuNDNDNTQ5LjY5IDQ3NS4wMSA1NDkgNDkzLjg2IDU0OSA1MTIuNUM1NDkgNTQzLjE3IDU0OSA1NzMuODMgNTQ5IDYwNC41QzU0OSA2MTcuMTcgNTQ5IDYyOS44MyA1NDkgNjQyLjVDNTQ5IDY0OS40MSA1NDguMzcgNjU2LjcxIDU0OS41IDY2My41QzU4Ny41IDY2My41IDYyNS41IDY2My41IDY2My41IDY2My41Wk0xMTYuMTcgMjkyLjE3QzExNi4xNyA0MTUuODQgMTE2LjE3IDUzOS41IDExNi4xNyA2NjMuMTZDMTI1LjE3IDY2NC4wNyAxMzQuNDUgNjYzLjUgMTQzLjUgNjYzLjVDMTYwLjE3IDY2My41IDE3Ni44MyA2NjMuNSAxOTMuNSA2NjMuNUMyMDMuMTEgNjYzLjUgMjIzLjM1IDY2NS4yMSAyMzEuNDkgNjYyLjVDMjMxLjQ5IDUzOS4wNiAyMzEuNDkgNDE1LjYyIDIzMS40OSAyOTIuMTdDMTkzLjA1IDI5Mi4xNyAxNTQuNjEgMjkyLjE3IDExNi4xNyAyOTIuMTdaTTgzOS44MyA2NDQuMTZDODM5LjgzIDY0Ni4zOSA4MzkuODMgNjQ4LjYyIDgzOS44MyA2NTAuODRDODM3LjE4IDY1Ny41NiA4MzUuMjEgNjYzLjE1IDgyOC4xIDY2Ni41N0M4MTQuNjYgNjczLjAyIDc5OC40NCA2NjMuNTEgNzk4LjA0IDY0OC41Qzc5Ny42MyA2MzIuOTMgODE0LjMgNjIyLjIzIDgyOC4zMyA2MjkuMThDODM1LjAyIDYzMi40OSA4MzYuOTEgNjM4LjA2IDgzOS44MyA2NDQuMTZaTTgxNS42NSA2MzAuMzJDNzk0LjMxIDYzNC4xNyA3OTguNTcgNjY3LjU2IDgyMC40MyA2NjUuNjRDODQ0LjE0IDY2My41NiA4MzkuNjkgNjI1Ljk3IDgxNS42NSA2MzAuMzJaTTgxMi41IDYzNi44M0M4MTYuMjMgNjM2LjgzIDgyMS40MSA2MzUuOTMgODI0Ljg1IDYzNy42MkM4MzEuNTUgNjQwLjkyIDgyNy4wNCA2NDcuNDkgODIyLjIzIDY0OS41QzgyMy45OSA2NTIuNjEgODI1Ljc0IDY1NS43MiA4MjcuNSA2NTguODRDODIwLjY3IDY1Ny45OSA4MjIuNTIgNjQ5LjcyIDgxNS41IDY0OS4xN0M4MTQuNzkgNjUyLjU3IDgxNS44MyA2NTYuNTkgODEzLjUgNjU4Ljg0QzgxMi4yIDY1Ny43IDgxMy4xOCA2NTkuNjQgODEyLjE5IDY1OC4yM0M4MTEuMjggNjU2Ljk1IDgxMS44MyA2NTMuOTkgODExLjgzIDY1Mi41QzgxMS44MyA2NDcuMzQgODExLjI2IDY0MS43OCA4MTIuNSA2MzYuODNaTTgxNS4xNyA2MzkuNUM4MTUuMTcgNjQxLjk1IDgxNS4xNyA2NDQuMzkgODE1LjE3IDY0Ni44M0M4MjAuMzIgNjQ2LjcxIDgyMy45NyA2NDcuNTcgODI0LjE2IDY0MS41QzgyMS40MSA2MzkuMjUgODE4LjY5IDYzOS41IDgxNS4xNyA2MzkuNVoiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAuMjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+"

function keywordOnlyText(text, keywords) {
  const n = text.length;
  const results = [];
  var i = 0;
  for (const keyword of keywords) {
    const index = text.indexOf(keyword);
    if (index > 0) results.push([i, index, styles.nonKeywordSpan]);
    const j = index + keyword.length
    results.push([index, j, aboutKeywordStyles[randomInt(aboutKeywordStyles.length)]]);
    i = j
  }
  if (i < n) results.push([i, n, styles.nonKeywordSpan]);
  return results;
}

export function KeywordText({ text, keywords }) {
  const [viewMode, setViewMode] = useState(-1);
  const [spans, setSpans] = useState([]);
  useEffect(() => {
      setViewMode(-1);
      setSpans(keywordOnlyText(text, keywords));
      const timerId = setTimeout(() => {
        setViewMode(0);
      }, 1000);
      return () => {
        clearTimeout(timerId);
      };
  }, [text]);

  return (
    <p>
      {spans.map((span, index) => { 
        const [start, end, style] = span;
        const buffer = [];
        var i = start
        while (i < end) {
          buffer.push(text[i]);
          i += 1
        }
        const result = buffer.join("");
        return (<span className={style} key={index}>{result}</span>);
      })}
    </p>
  );
}

      // <BackgroundShader />
export default function Home() {
  return (
    <div className={styles.page}>


      <header className={styles.header}>
        <div className={styles.avatar}>
          <div className={styles.avatarIcon}>
            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.nationbuilder.com%2Fjge%2Fpages%2F2097%2Fattachments%2Foriginal%2F1594341110%2Fmale-placeholder-image.jpg%3F1594341110&f=1&nofb=1&ipt=f9c4df02cb589ba2bbab0be6d00d917c842a9a43301d6750fb4a17526595301b" />
          </div>
          <div className={styles.socialIcon}>
            <img src={linkedInBase64}/>
          </div>
          <div className={styles.socialIconVariant1}>
            <img src={githubBase64} />
          </div>
        </div>
        <nav className={styles.navigation}>
          <a>About</a>
          <a>Projects</a>
          <a>Contact Me</a>
        </nav>
      </header>
      <main className={styles.main}>
        <h1>Welcome to the Amoebic Engineer</h1>
        <div className={styles.intro}>
          <KeywordText text={aboutText} keywords={aboutKeywords} />
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Projects
          </a>
        </div>
      <Amoeba />
      </main>
    </div>
  );
}
