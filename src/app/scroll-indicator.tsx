"use client";

import { useEffect } from "react";

export function ScrollIndicator() {
	useEffect(() => {
		let scrollTimer: NodeJS.Timeout;

		const handleScroll = (e: Event) => {
			const target = e.target as HTMLElement;
			if (target?.classList && target !== document.documentElement) {
				target.classList.add("scrolling");
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(() => {
					target.classList?.remove("scrolling");
				}, 1000);
			}
		};

		document.addEventListener("scroll", handleScroll, true);

		return () => {
			document.removeEventListener("scroll", handleScroll, true);
			clearTimeout(scrollTimer);
		};
	}, []);

	return null;
}
