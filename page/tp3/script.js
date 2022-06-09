var imgCount = 0;
var title;
var desc;
var imgContent = [
  ['imgOption1', 'BOM', 'Lorem ipsum dolor sit amet.'],
  ['imgOption2', 'DOM', 'Nullam fringilla imperdiet eleifend.'],
  ['imgOption3', 'Javascript', 'Cras dapibus ipsum a consequat tincidunt']
];

function previewImg(imgSrc){
  document.getElementById('imgViewer').src = imgSrc.src;
  document.getElementById('topicTt1').innerHTML = imgContent[imgSrc.id][1];
  document.getElementById('topicDescrpt').innerHTML = imgContent[imgSrc.id][2];
}