# -*- coding: utf-8 -*-
"""PRISM 설문지+OMR PDF 생성기 (7쪽: 표지 + 문항 5쪽 + OMR)
문항 텍스트는 index.html에서 직접 추출해 글자 단위 패리티 보장."""
import io, re, os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

W, H = A4
pdfmetrics.registerFont(TTFont('NG', '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'))
pdfmetrics.registerFont(TTFont('NGB', '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf'))

h = io.open('index.html', encoding='utf-8').read()
qs = re.findall(r"\{id:(\d+),text:'((?:[^'\\\\]|\\\\.)*)',axis:'\w+',pole:'\w+'", h)
qs = sorted(((int(i), t) for i, t in qs))
assert len(qs) == 96, len(qs)
assert '실천율' in qs[2][1] and '실천률' not in h, 'Q3 패리티'

OUT = 'PRISM_설문지_OMR.pdf'
c = canvas.Canvas(OUT, pagesize=A4)
FOOT_L = '다원교육 영재관 조준모T · PRISM'
SCALE = '① 전혀 아니다   ② 아니다   ③ 보통이다   ④ 그렇다   ⑤ 매우 그렇다'

def footer(pn):
    c.setFont('NG', 8); c.setFillGray(0.35)
    c.drawString(45, 28, FOOT_L)
    c.drawRightString(W-45, 28, '페이지 %d / 7' % pn)
    c.setFillGray(0)

def wrap(text, font, size, maxw):
    words = text.split(' '); lines=[]; cur=''
    for w_ in words:
        t = (cur+' '+w_).strip()
        if pdfmetrics.stringWidth(t, font, size) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            # 단어 자체가 길면 글자 단위 분할
            while pdfmetrics.stringWidth(w_, font, size) > maxw:
                k=len(w_)
                while pdfmetrics.stringWidth(w_[:k], font, size) > maxw: k-=1
                lines.append(w_[:k]); w_=w_[k:]
            cur = w_
    if cur: lines.append(cur)
    return lines

# ===== 1쪽: 표지 =====
logo='/mnt/user-data/outputs/dawon-logo.png'
if os.path.exists(logo):
    lw=120.0; lh=lw*115/218
    c.drawImage(logo, (W-lw)/2, 738, width=lw, height=lh, mask='auto')
c.setFont('NGB', 34); c.drawCentredString(W/2, 690, 'PRISM')
c.setFont('NG', 13); c.setFillGray(0.25)
c.drawCentredString(W/2, 668, '96문항 정밀 학습 행동 진단'); c.setFillGray(0)
c.setLineWidth(0.8); c.line(70, 652, W-70, 652)
c.setFont('NGB', 12)
c.drawString(80, 615, '이름'); c.line(115, 612, 265, 612)
c.drawString(300, 615, '검사일'); c.line(348, 612, W-80, 612)
# 안내 박스
c.setLineWidth(0.7); c.roundRect(70, 430, W-140, 150, 8)
c.setFont('NGB', 11.5); c.drawString(85, 558, '응답 기준 안내')
c.setFont('NG', 10); y=536
for line in [
 '· 이 검사는 좋고 나쁜 학생을 나누기 위한 검사가 아닙니다.',
 '· 각 문항은 실제 학습이 어떻게 시작되고, 어디서 막히며, 어떤 방식으로',
 '  회복되는지를 보기 위한 문항입니다.',
 '· 최근 1~2개월의 실제 공부 모습을 기준으로 답해 주세요.',
 '  이상적인 모습보다 실제 모습이 중요합니다.',
 '· 정답은 없습니다. 오래 고민하지 말고 떠오르는 대로 표시해 주세요.']:
    c.drawString(85, y, line); y-=16.5
# 척도 박스
c.setFillGray(0.94); c.roundRect(70, 372, W-140, 40, 8, stroke=0, fill=1); c.setFillGray(0)
c.setFont('NGB', 11); c.drawCentredString(W/2, 386, SCALE)
c.setFont('NG', 9.5); c.setFillGray(0.3)
c.drawCentredString(W/2, 330, '총 96문항 · 답안은 문항 옆 또는 마지막 장 OMR에 표시')
c.setFillGray(0)
footer(1); c.showPage()

# ===== 2~6쪽: 문항 =====
counts=[20,20,20,20,16]; idx=0
for pi, cnt in enumerate(counts):
    pn=pi+2
    c.setFont('NGB', 12); c.drawString(45, H-50, 'PRISM 문항지')
    c.setFont('NG', 8.2); c.setFillGray(0.3)
    c.drawRightString(W-45, H-50, SCALE.replace('   ', '  ')); c.setFillGray(0)
    c.setLineWidth(0.6); c.line(45, H-58, W-45, H-58)
    y=H-80
    for _ in range(cnt):
        qid, qt = qs[idx]; idx+=1
        num='%d.'%qid
        c.setFont('NGB', 9.5); c.drawString(45, y, num)
        tx=45+pdfmetrics.stringWidth('96.', 'NGB', 9.5)+4
        lines=wrap(qt, 'NG', 9.5, W-45-tx)
        c.setFont('NG', 9.5)
        for ln in lines:
            c.drawString(tx, y, ln); y-=12.5
        c.setFont('NG', 10); c.setFillGray(0.15)
        c.drawString(tx, y, '①      ②      ③      ④      ⑤'); c.setFillGray(0)
        y-=17.5
        if y<55: raise RuntimeError('page overflow p%d'%pn)
    footer(pn); c.showPage()

# ===== 7쪽: OMR =====
c.setFont('NGB', 14); c.drawString(45, H-46, 'PRISM OMR 답안지')
c.setFont('NG', 8.5); c.setFillGray(0.3)
c.drawString(45, H-52-8, '각 문항의 해당 번호에 ● 표시해 주세요. 수정할 때는 × 표시 후 옆에 다시 표시합니다.')
c.setFillGray(0)
c.setFont('NGB', 10)
c.drawString(320, H-46, '이름'); c.line(350, H-49, 445, H-49)
c.drawString(458, H-46, '검사일'); c.line(496, H-49, W-45, H-49)
c.setLineWidth(0.7); c.line(45, H-70, W-45, H-70)
top=H-88; rowh=13.5
colx=[52, 318]
c.setFont('NGB', 8.5)
for cx in colx:
    c.drawString(cx, top, '번호'); c.drawString(cx+34, top, '①      ②      ③      ④      ⑤')
c.setLineWidth(0.4); c.setStrokeGray(0.75)
c.line(W/2, top-6, W/2, top-6-48*rowh)
y0=top-6
for r in range(48):
    yy=y0-(r+1)*rowh
    for ci,cx in enumerate(colx):
        q=r+1+ci*48
        c.setFont('NGB', 8.5); c.setFillGray(0)
        c.drawString(cx, yy+3, '%02d'%q)
        c.setFont('NG', 9); c.setFillGray(0.15)
        c.drawString(cx+34, yy+3, '①      ②      ③      ④      ⑤')
    c.line(45, yy, W-45, yy)
c.setStrokeGray(0); c.setFillGray(0)
footer(7); c.showPage()
c.save()
import os
print('생성 완료:', OUT, round(os.path.getsize(OUT)/1024), 'KB')
