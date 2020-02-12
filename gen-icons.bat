@echo off

for %%f in (epc.design/images/*.svg) do (
  echo epc.design/images/%%f
  magick -size 16x epc.design/images/%%f -gravity center -extent 16x16 epc.edit/icons/full/obj16/%%~nf.gif
  magick -size 32x epc.design/images/%%f -gravity center -extent 32x32 epc.edit/icons/full/obj32/%%~nf.gif
)
