"use client"

import { isNamed, shortLabel, type PartId } from "@/lib/build"
import { cn } from "@/lib/utils"

type DeskSceneProps = {
  parts: Record<PartId, string>
  selected: PartId | null
  onSelect: (id: PartId) => void
  className?: string
}

const INK = "#2a2118"
const MUTED = "#8d7b6c"
const CREAM = "#fbf7f1"
const COPPER = "#c56a2d"
const PAPER = "#f4efe6"

function bayStroke(named: boolean, darkBay: boolean) {
  if (named) return INK
  return darkBay ? "#f0e6da" : MUTED
}

function PartButton({
  id,
  label,
  value,
  selected,
  onSelect,
  bounds,
  children,
}: {
  id: PartId
  label: string
  value: string
  selected: boolean
  onSelect: (id: PartId) => void
  bounds: { x: number; y: number; w: number; h: number }
  children: React.ReactNode
}) {
  const named = isNamed(value)
  return (
    <g
      data-part={id}
      data-testid={`drawing-${id}`}
      data-named={named ? "true" : "false"}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={
        named ? `${label}: ${value.trim()}` : `${label}, not named yet`
      }
      onClick={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          event.stopPropagation()
          onSelect(id)
        }
      }}
    >
      <title>{named ? value.trim() : `Add ${label.toLowerCase()}`}</title>
      <rect
        data-ring
        data-on={selected ? "true" : "false"}
        x={bounds.x - 7}
        y={bounds.y - 7}
        width={bounds.w + 14}
        height={bounds.h + 14}
        rx={14}
      />
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.w}
        height={bounds.h}
        fill="#000"
        fillOpacity={0.001}
      />
      {children}
    </g>
  )
}

function Tag({
  x,
  y,
  kicker,
  value,
  anchor = "start",
  light = false,
  max = 18,
}: {
  x: number
  y: number
  kicker: string
  value: string
  anchor?: "start" | "middle" | "end"
  light?: boolean
  max?: number
}) {
  const named = isNamed(value)
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={named ? (light ? "#f6efe6" : INK) : light ? "#f0d3b4" : COPPER}
      fontSize={12}
      fontWeight={named ? 650 : 560}
      fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
    >
      {named ? shortLabel(value, max) : kicker}
    </text>
  )
}

function NamePlate({
  x,
  y,
  kicker,
  value,
  width = 156,
}: {
  x: number
  y: number
  kicker: string
  value: string
  width?: number
}) {
  const named = isNamed(value)
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={named ? 38 : 26}
        rx={8}
        fill={named ? "#fffaf3" : PAPER}
        stroke={named ? COPPER : "#c4b5a6"}
        strokeWidth={1.4}
      />
      <text
        x={x + 10}
        y={y + 16}
        fill="#6d5c4e"
        fontSize={11}
        letterSpacing={1.2}
        fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
      >
        {kicker.toUpperCase()}
      </text>
      {named ? (
        <text
          x={x + 10}
          y={y + 31}
          fill={INK}
          fontSize={13}
          fontWeight={650}
          fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
        >
          {shortLabel(value, Math.max(12, Math.floor(width / 7.6)))}
        </text>
      ) : (
        <text
          x={x + width - 10}
          y={y + 16}
          textAnchor="end"
          fill={COPPER}
          fontSize={11}
          fontWeight={650}
          fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
        >
          Add
        </text>
      )}
    </g>
  )
}

function Fan({
  cx,
  cy,
  r,
  named,
  stroke,
}: {
  cx: number
  cy: number
  r: number
  named: boolean
  stroke: string
}) {
  return (
    <g stroke={stroke} fill={named ? "#241c18" : "none"} strokeWidth={1.4}>
      <circle cx={cx} cy={cy} r={r} fill={named ? "#1c1917" : CREAM} />
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r + 2}
          transform={`rotate(${angle} ${cx} ${cy})`}
          stroke={named ? "#e2b57e" : stroke}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.22} fill={named ? COPPER : "none"} />
    </g>
  )
}

export function DeskScene({
  parts,
  selected,
  onSelect,
  className,
}: DeskSceneProps) {
  const darkBay = isNamed(parts.case)
  const shared = { selected, onSelect }

  return (
    <div className={cn("desk-scene", className)}>
      <svg
        viewBox="0 0 1280 880"
        role="group"
        aria-label="Illustrated desk with an open case, headset, and microphone"
        className="h-auto w-full select-none"
      >
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbf6ee" />
            <stop offset="70%" stopColor="#efe3d2" />
            <stop offset="100%" stopColor="#e5d3bc" />
          </linearGradient>
          <radialGradient id="lamp" cx="50%" cy="20%" r="55%">
            <stop offset="0%" stopColor="#fffaf2" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fffaf2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9a6242" />
            <stop offset="45%" stopColor="#7a4b31" />
            <stop offset="100%" stopColor="#684028" />
          </linearGradient>
          <pattern
            id="grain"
            width="160"
            height="46"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 16 Q 40 8 80 18 T 160 14"
              fill="none"
              stroke="#4a2b1c"
              strokeOpacity="0.22"
              strokeWidth="1.2"
            />
            <path
              d="M0 32 Q 50 40 100 28 T 160 34"
              fill="none"
              stroke="#f3d7be"
              strokeOpacity="0.16"
              strokeWidth="1.1"
            />
          </pattern>
          <pattern id="mesh" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.15" fill="#1a1614" fillOpacity="0.55" />
          </pattern>
          <pattern id="popmesh" width="7" height="7" patternUnits="userSpaceOnUse">
            <path
              d="M0 7 L7 0 M0 0 L7 7"
              stroke={INK}
              strokeOpacity="0.28"
              strokeWidth="0.7"
            />
          </pattern>
          <linearGradient id="screenOn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2c24" />
            <stop offset="100%" stopColor="#241912" />
          </linearGradient>
        </defs>

        <rect width="1280" height="880" fill="url(#wall)" />
        <ellipse cx="760" cy="120" rx="420" ry="180" fill="url(#lamp)" />
        <path
          d="M0 492 H1280"
          stroke="#d9c7b0"
          strokeWidth="2"
        />

        <g>
          <rect x="24" y="508" width="1232" height="292" rx="20" fill="url(#deskTop)" />
          <rect
            x="24"
            y="508"
            width="1232"
            height="292"
            rx="20"
            fill="url(#grain)"
            opacity="0.55"
          />
          <path
            d="M24 768 H1256 V844 Q1256 864 1236 864 H44 Q24 864 24 844 Z"
            fill="#3e271b"
          />
          <path
            d="M48 786 H1232"
            stroke={COPPER}
            strokeOpacity="0.75"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        <ellipse cx="280" cy="524" rx="210" ry="16" fill="#3a2418" opacity="0.2" />
        <ellipse cx="730" cy="518" rx="180" ry="12" fill="#3a2418" opacity="0.16" />

        <g transform="translate(48 104)">
          <PartButton
            {...shared}
            id="case"
            label="Case"
            value={parts.case}
            selected={selected === "case"}
            bounds={{ x: -36, y: -22, w: 500, h: 430 }}
          >
            <path
              d="M-6 404 L22 36 L46 42 L18 410 Z"
              fill={isNamed(parts.case) ? "#d7ebe8" : CREAM}
              stroke={bayStroke(isNamed(parts.case), false)}
              strokeWidth={1.8}
              opacity={isNamed(parts.case) ? 0.85 : 1}
            />
            <path
              d="M8 120 H28 M8 200 H28 M8 280 H28"
              stroke={isNamed(parts.case) ? "#9fd0c8" : "#ddd2c4"}
              strokeWidth="2"
            />
            <rect
              x="0"
              y="0"
              width="456"
              height="404"
              rx="16"
              fill={isNamed(parts.case) ? "#3a342f" : CREAM}
              stroke={bayStroke(isNamed(parts.case), false)}
              strokeWidth={isNamed(parts.case) ? 2.4 : 1.8}
            />
            <rect
              x="0"
              y="-16"
              width="456"
              height="28"
              rx="8"
              fill={isNamed(parts.case) ? "#4a433d" : PAPER}
              stroke={bayStroke(isNamed(parts.case), false)}
            />
            <rect x="18" y="16" width="52" height="364" rx="6" fill="url(#mesh)" />
            <rect
              x="18"
              y="16"
              width="52"
              height="364"
              rx="6"
              fill="none"
              stroke={isNamed(parts.case) ? "#1a1614" : MUTED}
            />
            <rect
              x="82"
              y="24"
              width="356"
              height="360"
              rx="8"
              fill={darkBay ? "#241e1b" : "#f7f1e8"}
              stroke={darkBay ? "#5c5148" : "#e4d8c8"}
            />
            {[
              [28, 14],
              [420, 14],
              [28, 390],
              [420, 390],
            ].map(([cx, cy]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="3.2"
                fill={isNamed(parts.case) ? "#cbbba8" : "#d9cec2"}
              />
            ))}
            <Tag
              x={228}
              y={4}
              kicker="Case"
              value={parts.case}
              anchor="middle"
              light={isNamed(parts.case)}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="motherboard"
            label="Motherboard"
            value={parts.motherboard}
            selected={selected === "motherboard"}
            bounds={{ x: 96, y: 40, w: 328, h: 286 }}
          >
            <rect
              x="96"
              y="40"
              width="328"
              height="286"
              rx="6"
              fill={
                isNamed(parts.motherboard)
                  ? "#173f36"
                  : darkBay
                    ? "#2a2623"
                    : "#f3faf7"
              }
              stroke={bayStroke(isNamed(parts.motherboard), darkBay)}
              strokeWidth={1.7}
            />
            <g
              pointerEvents="none"
              stroke={isNamed(parts.motherboard) ? "#2f6d5c" : darkBay ? "#6d6258" : "#d5e4df"}
              strokeWidth="1.2"
              fill="none"
            >
              <path d="M120 70 H250 M120 96 H210 M340 80 H400 M140 250 H300 M300 180 V280" />
              <circle cx="390" cy="300" r="10" />
              <rect x="112" y="280" width="36" height="22" rx="2" />
            </g>
            <Tag
              x={408}
              y={62}
              kicker="Board"
              value={parts.motherboard}
              anchor="end"
              light={isNamed(parts.motherboard) || darkBay}
              max={16}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="cpu"
            label="Processor"
            value={parts.cpu}
            selected={selected === "cpu"}
            bounds={{ x: 112, y: 78, w: 70, h: 70 }}
          >
            <rect
              x="112"
              y="78"
              width="70"
              height="70"
              rx="6"
              fill={isNamed(parts.cpu) ? "#d8d2c8" : darkBay ? "#3a342f" : CREAM}
              stroke={bayStroke(isNamed(parts.cpu), darkBay)}
              strokeWidth={1.7}
            />
            <rect
              x="124"
              y="90"
              width="46"
              height="46"
              rx="4"
              fill={isNamed(parts.cpu) ? "#b7c4b4" : "none"}
              stroke={bayStroke(isNamed(parts.cpu), darkBay)}
            />
            <Tag
              x={147}
              y={120}
              kicker="CPU"
              value={parts.cpu}
              anchor="middle"
              max={8}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="cooler"
            label="Cooler"
            value={parts.cooler}
            selected={selected === "cooler"}
            bounds={{ x: 198, y: 64, w: 92, h: 118 }}
          >
            <rect
              x="214"
              y="64"
              width="60"
              height="118"
              rx="4"
              fill={isNamed(parts.cooler) ? "#4e585c" : darkBay ? "#3a342f" : CREAM}
              stroke={bayStroke(isNamed(parts.cooler), darkBay)}
              strokeWidth={1.7}
            />
            {Array.from({ length: 7 }, (_, index) => (
              <line
                key={index}
                x1="220"
                x2="268"
                y1={74 + index * 12}
                y2={74 + index * 12}
                stroke={isNamed(parts.cooler) ? "#c5ced2" : bayStroke(false, darkBay)}
                strokeWidth="1.4"
              />
            ))}
            <Fan
              cx={214}
              cy={124}
              r={28}
              named={isNamed(parts.cooler)}
              stroke={bayStroke(isNamed(parts.cooler), darkBay)}
            />
            <Tag
              x={244}
              y={170}
              kicker="Cooler"
              value={parts.cooler}
              anchor="middle"
              light
              max={9}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="ram"
            label="Memory"
            value={parts.ram}
            selected={selected === "ram"}
            bounds={{ x: 304, y: 70, w: 104, h: 108 }}
          >
            {[0, 1, 2, 3].map((stick) => (
              <g key={stick} transform={`translate(${304 + stick * 26} 70)`}>
                <rect
                  width="20"
                  height="96"
                  rx="3"
                  fill={isNamed(parts.ram) ? "#1b1a19" : darkBay ? "#3a342f" : CREAM}
                  stroke={bayStroke(isNamed(parts.ram), darkBay)}
                  strokeWidth={1.5}
                />
                <rect
                  y="0"
                  width="20"
                  height="10"
                  rx="2"
                  fill={isNamed(parts.ram) ? COPPER : "none"}
                  stroke={bayStroke(isNamed(parts.ram), darkBay)}
                />
              </g>
            ))}
            <Tag
              x={356}
              y={184}
              kicker="Memory"
              value={parts.ram}
              anchor="middle"
              light={darkBay}
              max={14}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="storage"
            label="Storage"
            value={parts.storage}
            selected={selected === "storage"}
            bounds={{ x: 304, y: 214, w: 126, h: 36 }}
          >
            <rect
              x="304"
              y="214"
              width="126"
              height="28"
              rx="3"
              fill={isNamed(parts.storage) ? "#d5dbdf" : darkBay ? "#3a342f" : CREAM}
              stroke={bayStroke(isNamed(parts.storage), darkBay)}
              strokeWidth={1.6}
            />
            <rect
              x="314"
              y="220"
              width="22"
              height="16"
              rx="2"
              fill={isNamed(parts.storage) ? "#8d98a0" : "none"}
              stroke={bayStroke(isNamed(parts.storage), darkBay)}
            />
            <rect
              x="342"
              y="220"
              width="16"
              height="16"
              rx="2"
              fill={isNamed(parts.storage) ? "#8d98a0" : "none"}
              stroke={bayStroke(isNamed(parts.storage), darkBay)}
            />
            <Tag
              x={367}
              y={260}
              kicker="Storage"
              value={parts.storage}
              anchor="middle"
              light={darkBay}
              max={16}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="gpu"
            label="Graphics card"
            value={parts.gpu}
            selected={selected === "gpu"}
            bounds={{ x: 110, y: 292, w: 300, h: 62 }}
          >
            <rect
              x="110"
              y="292"
              width="300"
              height="54"
              rx="6"
              fill={isNamed(parts.gpu) ? "#2a2725" : darkBay ? "#3a342f" : CREAM}
              stroke={bayStroke(isNamed(parts.gpu), darkBay)}
              strokeWidth={1.7}
            />
            <rect
              x="110"
              y="292"
              width="300"
              height="8"
              rx="3"
              fill={isNamed(parts.gpu) ? COPPER : "none"}
            />
            <Fan
              cx={168}
              cy={320}
              r={18}
              named={isNamed(parts.gpu)}
              stroke={bayStroke(isNamed(parts.gpu), darkBay)}
            />
            <Fan
              cx={220}
              cy={320}
              r={18}
              named={isNamed(parts.gpu)}
              stroke={bayStroke(isNamed(parts.gpu), darkBay)}
            />
            <Tag
              x={396}
              y={326}
              kicker="GPU"
              value={parts.gpu}
              anchor="end"
              light
              max={16}
            />
          </PartButton>

          <PartButton
            {...shared}
            id="psu"
            label="Power supply"
            value={parts.psu}
            selected={selected === "psu"}
            bounds={{ x: 96, y: 366, w: 328, h: 48 }}
          >
            <rect
              x="96"
              y="366"
              width="328"
              height="44"
              rx="6"
              fill={isNamed(parts.psu) ? "#3d3935" : darkBay ? "#322c28" : CREAM}
              stroke={bayStroke(isNamed(parts.psu), darkBay)}
              strokeWidth={1.7}
            />
            <Fan
              cx={384}
              cy={388}
              r={16}
              named={isNamed(parts.psu)}
              stroke={bayStroke(isNamed(parts.psu), darkBay)}
            />
            <Tag
              x={116}
              y={393}
              kicker="Power"
              value={parts.psu}
              light
              max={18}
            />
          </PartButton>
        </g>

        <g pointerEvents="none" stroke={MUTED} strokeDasharray="4 4" fill="none">
          <path d="M232 250 H268" transform="translate(48 104)" />
        </g>

        <PartButton
          {...shared}
          id="monitor"
          label="Monitor"
          value={parts.monitor}
          selected={selected === "monitor"}
          bounds={{ x: 530, y: 132, w: 390, h: 360 }}
        >
          <rect
            x="548"
            y="148"
            width="360"
            height="236"
            rx="12"
            fill={isNamed(parts.monitor) ? "#1a1614" : CREAM}
            stroke={isNamed(parts.monitor) ? INK : MUTED}
            strokeWidth={isNamed(parts.monitor) ? 8 : 2}
          />
          <rect
            x="566"
            y="164"
            width="324"
            height="196"
            rx="4"
            fill={isNamed(parts.monitor) ? "url(#screenOn)" : "#f7f3ec"}
            stroke={isNamed(parts.monitor) ? "#5c4636" : "#e4d8c8"}
          />
          {isNamed(parts.monitor) ? (
            <>
              <rect x="566" y="164" width="324" height="6" fill={COPPER} opacity="0.8" />
              <text
                x="728"
                y="258"
                textAnchor="middle"
                fill="#f3d7be"
                fontSize="22"
                fontFamily="var(--font-fraunces), Georgia, serif"
              >
                {shortLabel(parts.monitor, 22)}
              </text>
              <text
                x="728"
                y="284"
                textAnchor="middle"
                fill="#e2b57e"
                fontSize="12"
                letterSpacing="1.4"
                fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
              >
                DISPLAY
              </text>
            </>
          ) : (
            <text
              x="728"
              y="270"
              textAnchor="middle"
              fill={MUTED}
              fontSize="16"
              fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
            >
              Add display
            </text>
          )}
          <rect
            x="716"
            y="384"
            width="18"
            height="108"
            rx="4"
            fill={isNamed(parts.monitor) ? "#2e2926" : CREAM}
            stroke={isNamed(parts.monitor) ? INK : MUTED}
          />
          <ellipse
            cx="725"
            cy="504"
            rx="78"
            ry="16"
            fill={isNamed(parts.monitor) ? "#2e2926" : CREAM}
            stroke={isNamed(parts.monitor) ? INK : MUTED}
          />
        </PartButton>

        <PartButton
          {...shared}
          id="headset"
          label="Headset"
          value={parts.headset}
          selected={selected === "headset"}
          bounds={{ x: 78, y: 536, w: 292, h: 286 }}
        >
          <ellipse
            cx="224"
            cy="792"
            rx="96"
            ry="18"
            fill={isNamed(parts.headset) ? "#4a2b1c" : "#efe4d6"}
            stroke={isNamed(parts.headset) ? INK : MUTED}
            strokeWidth={1.8}
          />
          <rect
            x="216"
            y="676"
            width="16"
            height="116"
            rx="6"
            fill={isNamed(parts.headset) ? "#5c5148" : CREAM}
            stroke={isNamed(parts.headset) ? INK : MUTED}
            strokeWidth={1.8}
          />
          <path
            d="M150 676 H298"
            stroke={isNamed(parts.headset) ? "#cbbba8" : MUTED}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M132 640 C132 548 316 548 316 640"
            fill="none"
            stroke={isNamed(parts.headset) ? "#1c1613" : MUTED}
            strokeWidth={isNamed(parts.headset) ? 18 : 3}
            strokeLinecap="round"
          />
          <path
            d="M150 636 C154 572 294 572 298 636"
            fill="none"
            stroke={isNamed(parts.headset) ? COPPER : "#d9cec2"}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {[118, 250].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="612"
                width="86"
                height="112"
                rx="32"
                fill={isNamed(parts.headset) ? "#241c17" : CREAM}
                stroke={isNamed(parts.headset) ? INK : MUTED}
                strokeWidth={2}
              />
              <ellipse
                cx={x + 43}
                cy="668"
                rx="26"
                ry="36"
                fill={isNamed(parts.headset) ? "#8d4520" : "none"}
                stroke={isNamed(parts.headset) ? "#e2b57e" : MUTED}
                strokeWidth="3"
              />
            </g>
          ))}
          <NamePlate x={146} y={544} kicker="Headset" value={parts.headset} width={168} />
        </PartButton>

        <PartButton
          {...shared}
          id="keyboard"
          label="Keyboard"
          value={parts.keyboard}
          selected={selected === "keyboard"}
          bounds={{ x: 500, y: 560, w: 330, h: 168 }}
        >
          <rect
            x="508"
            y="612"
            width="312"
            height="100"
            rx="12"
            fill={isNamed(parts.keyboard) ? "#241c18" : CREAM}
            stroke={isNamed(parts.keyboard) ? INK : MUTED}
            strokeWidth={1.8}
          />
          {[0, 1, 2, 3].map((row) =>
            Array.from({ length: row === 3 ? 8 : 12 }, (_, column) => (
              <rect
                key={`${row}-${column}`}
                x={524 + column * 24 + (row === 3 ? 28 : 0)}
                y={626 + row * 20}
                width={row === 3 && column === 7 ? 70 : 18}
                height="14"
                rx="2"
                fill={isNamed(parts.keyboard) ? "#f4efe6" : "none"}
                stroke={isNamed(parts.keyboard) ? "#cbbba8" : MUTED}
              />
            )),
          )}
          <NamePlate x={508} y={568} kicker="Keyboard" value={parts.keyboard} width={180} />
        </PartButton>

        <PartButton
          {...shared}
          id="mouse"
          label="Mouse"
          value={parts.mouse}
          selected={selected === "mouse"}
          bounds={{ x: 850, y: 590, w: 92, h: 150 }}
        >
          <path
            d="M874 630
               C874 604 918 604 918 632
               L924 700
               C926 734 866 736 862 702 Z"
            fill={isNamed(parts.mouse) ? "#2a241f" : CREAM}
            stroke={isNamed(parts.mouse) ? INK : MUTED}
            strokeWidth={1.8}
          />
          <path
            d="M896 632 V656"
            stroke={isNamed(parts.mouse) ? COPPER : MUTED}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <NamePlate x={848} y={742} kicker="Mouse" value={parts.mouse} width={110} />
        </PartButton>

        <PartButton
          {...shared}
          id="microphone"
          label="Microphone"
          value={parts.microphone}
          selected={selected === "microphone"}
          bounds={{ x: 960, y: 530, w: 292, h: 280 }}
        >
          <rect
            x="1224"
            y="548"
            width="28"
            height="34"
            rx="4"
            fill={isNamed(parts.microphone) ? "#4a433d" : CREAM}
            stroke={isNamed(parts.microphone) ? INK : MUTED}
            strokeWidth={1.8}
          />
          <path
            d="M1236 566 C1170 590 1140 640 1104 682"
            fill="none"
            stroke={isNamed(parts.microphone) ? "#5c5148" : MUTED}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle
            cx="1104"
            cy="682"
            r="8"
            fill={isNamed(parts.microphone) ? COPPER : CREAM}
            stroke={isNamed(parts.microphone) ? INK : MUTED}
          />
          <circle
            cx="1064"
            cy="724"
            r="48"
            fill="none"
            stroke={isNamed(parts.microphone) ? INK : MUTED}
            strokeWidth="7"
          />
          {[0, 45, 90, 135].map((angle) => (
            <line
              key={angle}
              x1="1064"
              y1="724"
              x2="1064"
              y2="684"
              stroke={isNamed(parts.microphone) ? "#8d7b6c" : MUTED}
              strokeWidth="2"
              transform={`rotate(${angle} 1064 724)`}
            />
          ))}
          <rect
            x="1038"
            y="704"
            width="120"
            height="40"
            rx="20"
            fill={isNamed(parts.microphone) ? "#e2b57e" : CREAM}
            stroke={isNamed(parts.microphone) ? INK : MUTED}
            strokeWidth={1.8}
          />
          <circle
            cx="1040"
            cy="724"
            r="24"
            fill={isNamed(parts.microphone) ? "#2a241f" : PAPER}
            stroke={isNamed(parts.microphone) ? INK : MUTED}
            strokeWidth={1.8}
          />
          {[0, 1, 2, 3].map((slot) => (
            <line
              key={slot}
              x1={1028 + slot * 6}
              y1="712"
              x2={1028 + slot * 6}
              y2="736"
              stroke={isNamed(parts.microphone) ? "#e2b57e" : MUTED}
              strokeWidth="1.4"
            />
          ))}
          <path
            d="M1036 766 H990"
            stroke={isNamed(parts.microphone) ? "#5c5148" : MUTED}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle
            cx="972"
            cy="766"
            r="40"
            fill={isNamed(parts.microphone) ? "url(#popmesh)" : CREAM}
            stroke={isNamed(parts.microphone) ? COPPER : MUTED}
            strokeWidth={isNamed(parts.microphone) ? 6 : 2}
          />
          <NamePlate
            x={1048}
            y={548}
            kicker="Microphone"
            value={parts.microphone}
            width={170}
          />
        </PartButton>
      </svg>
    </div>
  )
}
