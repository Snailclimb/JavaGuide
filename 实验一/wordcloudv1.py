##pip install -i https://pypi.tuna.tsinghua.edu.cn/simple jieba
##pip install opencv_python
##pip install numpy
##pip install wordcloud
##pip install matplotlib

#GovRptWordCloudV1.py
import jieba as j
from wordcloud import WordCloud
import cv2
from  matplotlib import pyplot as plt 
mask =cv2.imread("16pic.jpg")
f =open("沉默的羔羊.txt","r",encoding="utf-8")
t =f.read()
f.close()
ls =j.lcut(t)
txt=" ".join(ls)
font=r'C:\Windows\Fonts\FZSTK.TTF'
w =WordCloud(font_path=font,\
               width = 1000,height = 700,background_color = "white",\
               mask=mask)
w.generate(txt)
w.to_file("grwordcloud.png")

plt.imshow(w)
plt.axis('off')
plt.show()
