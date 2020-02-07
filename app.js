const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    image.quality(100).write(outputFile);
    console.log('The file has been created!');
    startApp();
    }
    catch(error) {
        console.log('Something went wrong!');
    } 
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
  
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    image.quality(100).write(outputFile);
    console.log('The file has been created!');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong!');
  } 
};

function prepareOutputFilename(name) {
  const array = name.split('.');
  const firstPart = array[0] + '-with-watermark';
  return firstPart + '.' + array[1];
}

  /*const prepareOutputFilename = (filename) => {
    const [ name, ext ] = filename.split('.');
    return `${name}-with-watermark.${ext}`;
  };*/

  const startApp = async () => {

    // Ask if user is ready
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
      }]);
  
    // if answer is no, just quit the app
    if(!answer.start) process.exit();
  
    // ask about input file and watermark type
    const options = await inquirer.prompt([{
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpeg',
    }, {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    }]);

    if(!fs.existsSync('./img/' + options.inputImage)) {
        process.stdout.write('File does not exist! Try again');
        process.exit();
    }

    if(options.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
          name: 'value',
          type: 'input',
          message: 'Type your watermark text:',
        }]);
        options.watermarkText = text.value;
        const endFileName = prepareOutputFilename(options.inputImage);
        addTextWatermarkToImage('./img/' + options.inputImage, './' + endFileName, options.watermarkText);
      }
      else {
        const image = await inquirer.prompt([{
          name: 'filename',
          type: 'input',
          message: 'Type your watermark name:',
          default: 'logo.png',
        }]);
        options.watermarkImage = image.filename;
        if(!fs.existsSync('./img/' + options.watermarkImage)) {
            process.stdout.write('File does not exist! Try again');
            process.exit();
        }
        const endFileName = prepareOutputFilename(options.inputImage);
        addImageWatermarkToImage('./img/' + options.inputImage, './' + endFileName, './img/' + options.watermarkImage);
      }
  }
  
  startApp();