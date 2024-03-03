import * as eases from 'svelte/easing';
import { crossfade } from 'svelte/transition'

export const scale = (
	node,
	{ delay = 0, duration = 300, easing = eases.cubicOut, fade = true }
) => {
	const style = getComputedStyle(node);
	const margin = { top: parseFloat(style.marginTop), right: parseFloat(style.marginRight), bottom: parseFloat(style.marginBottom), left: parseFloat(style.marginLeft) };
	const padding = { top: parseFloat(style.paddingTop), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), left: parseFloat(style.paddingLeft) };
	const border = { top: parseFloat(style.borderTop), right: parseFloat(style.borderRight), bottom: parseFloat(style.borderBottom), left: parseFloat(style.borderLeft) };
	const opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	const width = parseFloat(style.width);
	const height = parseFloat(style.height);
	return {
		delay,
		duration,
		easing,
		css: t => `
			overflow: hidden;
			width: ${t * width}px;
			height: ${t * height}px;
			margin-top: ${t * margin.top}px;
			margin-bottom: ${t * margin.bottom}px;
			margin-left: ${t * margin.left}px;
			margin-right: ${t * margin.right}px;
			padding-top: ${t * padding.top}px;
			padding-bottom: ${t * padding.bottom}px;
			padding-left: ${t * padding.left}px;
			padding-right: ${t * padding.right}px;
			border-width: ${t * border.left}px;
			transform: ${transform} scale(${t});
			opacity: ${fade ? t * opacity : opacity};
			white-space: nowrap;
		`
	};
}

export const spin = (node, { deg = 45, duration = 400, easing = eases.cubicOut }) => {
	return {
		duration,
		easing,
		css: (t, u) => `
			opacity: ${t};
			transform: rotate(${u * deg}deg);`
	};
}

export const shift = (node, {
	delay = 0,
	duration = 400,
	easing = eases.cubicOut,
	x = 0,
	y = 0,
	type = 'top',
	units = 'px'
}) => {
	return {
		delay,
		duration,
		easing,
		css: t => `
			margin-${type}: ${(1 - t) * ((type === 'top' || type === 'bottom') ? y : x)}${units};`
	};
}

export const fly = (node, {
	delay = 0,
	duration = 400,
	easing = eases.cubicOut,
	x = 0,
	y = 0,
	units = 'px'
}) => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	const width = parseInt(style.width);

	return {
		delay,
		duration,
		easing,
		css: t => `
			transform: ${transform} translate(${(1 - t) * x}${units}, ${(1 - t) * y}${units});
			${t < 0.5 ? `width: ${0}px;` : `width: ${width}px;`}
			overflow: shown;`
	};
}

export const day = (
	node,
	{ axis = 'height', delay = 0, duration = 300, easing = eases.cubicOut }
) => {
	const height = parseFloat(getComputedStyle(node)[axis]);

	return {
		delay,
		duration,
		easing,
		css: t => `
			overflow: hidden;
			${axis}: ${t * height}px;
		`
	};
}

export const slide = (
	node,
	{ axis = 'height', delay = 0, duration = 300, easing = eases.cubicOut, fade = false }
) => {
	const style = getComputedStyle(node);
	const margin = { top: parseFloat(style.marginTop), right: parseFloat(style.marginRight), bottom: parseFloat(style.marginBottom), left: parseFloat(style.marginLeft) };
	const padding = { top: parseFloat(style.paddingTop), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), left: parseFloat(style.paddingLeft) };
	const border = { top: parseFloat(style.borderTop), right: parseFloat(style.borderRight), bottom: parseFloat(style.borderBottom), left: parseFloat(style.borderLeft) };
	const opacity = +style.opacity;

	const width = parseFloat(style.width);
	const height = parseFloat(style.height);
	return {
		delay,
		duration,
		easing,
		css: t => `
			overflow: hidden;
			width: ${axis !== 'height' ? t * width : width}px;
			height: ${axis !== 'width' ? t * height : height}px;
			margin-top: ${axis !== 'width' ? t * margin.top : margin.top}px;
			margin-bottom: ${axis !== 'width' ? t * margin.bottom : margin.bottom}px;
			margin-left: ${axis !== 'height' ? t * margin.left : margin.left}px;
			margin-right: ${axis !== 'height' ? t * margin.right : margin.right}px;
			padding-top: ${axis !== 'width' ? t * padding.top : padding.top}px;
			padding-bottom: ${axis !== 'width' ? t * padding.bottom : padding.bottom}px;
			padding-left: ${axis !== 'height' ? t * padding.left : padding.left}px;
			padding-right: ${axis !== 'height' ? t * padding.right : padding.right}px;
			border-width: ${axis !== 'width' ? t * border.top : border.top}px ${axis !== 'height' ? t * border.right : border.right}px ${axis !== 'width' ? t * border.bottom : border.bottom}px ${axis !== 'height' ? t * border.left : border.left}px;
			opacity: ${fade ? t * opacity : opacity};
			white-space: nowrap;
		`
	};
}

export const motion = (node, { movement, transition }) => {
	const { x = 0, y = 0, units = 'px', fade = true } = movement;
	const { delay = 0, duration = 400 } = transition || {};
	const easing = eases[transition?.easing] ?? eases.cubicOut;

	const style = getComputedStyle(node);

	return {
		delay,
		duration,
		easing,
		css: t => `
		${fade ? `opacity: ${t * +style.opacity};` : ''}
		transform: translate(${t * x - x}${units}, ${t * y - y}${units});`
	};
}

export const draw = (node, params) => {
	const len = node.getTotalLength();

	return {
		delay: params.delay,
		duration: params.duration || 800,
		easing: params.easing || eases.cubicOut,
		css: (t, u) => `stroke-dasharray: ${(params.reverse ? u : t) * len} ${(params.reverse ? t : u) * len}`
	};
}

export const [send, receive] = crossfade({
	duration: (d) => Math.sqrt(d * 200),

	fallback(node, params) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		return {
			duration: 600,
			easing: eases.quintOut,
			css: (t) => `
				transform: ${transform} scale(${t});
				opacity: ${t}
			`
		};
	}
})