import { t } from 'testcafe'
import logger from '../../helpers/logger'
import {
  getPageUrl,
  isExistingAndVisible,
  overwriteCopyCommand,
  getLastExecutedCommand
} from '../../helpers/utils'
import * as selectors from '../selectors'
import DrivePage from './drive-model'

export default class privateDrivePage extends DrivePage {
  //@param {Selector}  btn : button to tests
  //@param {text} path : redirection path
  //@param {text} title : text for logger.debug
  async isSidebarButton(btn, path, title) {
    await isExistingAndVisible(`${title}`, btn)
    await t.expect(btn.getAttribute('href')).eql(path)
  }

  //@param {Selector}  btn : button to tests
  //@param {text} path : redirection path
  //@param {text} title : Button title
  async clickOnSidebarButton(btn, path, title) {
    await t
      .click(btn)
      .expect(getPageUrl())
      .contains(path)
    await this.waitForLoading()

    if (!t.fixtureCtx.isVR)
      await t.expect(await this.getbreadcrumb()).contains(title)

    await t.expect(selectors.errorEmpty.exists).notOk('Error shows up')
    await t.expect(selectors.errorOops.exists).notOk('Error shows up')
    logger.debug(`Navigation to ${title} OK!`)
  }

  async openCozyBarMenu() {
    await isExistingAndVisible('selectors.btnMainApp')
    await t.click(selectors.btnMainApp)
    await isExistingAndVisible('selectors.cozNavPopContent')
  }

  async checkMainMenu() {
    await isExistingAndVisible('selectors.cozBar')
    await this.openCozyBarMenu()
    await isExistingAndVisible('selectors.btnCozBarDrive')

    await t
      .expect(
        selectors.btnCozBarDrive.parent('li').filter('[class*=current]').exists
      )
      .ok('selectors.btnCozBarDrive.parent(li).filter([class*=current])')
  }

  async openActionMenu() {
    await isExistingAndVisible('selectors.toolbarDrive')
    await isExistingAndVisible(`selectors.btnMoreMenu`)
    await t.click(selectors.btnMoreMenu)
    await isExistingAndVisible('selectors.cozyMenuInner')
  }

  //@param {String} newFolderName
  async addNewFolder({
    newFolderName: newFolderName,
    screenshotPath: screenshotPath,
    withMask = false
  }) {
    let breadcrumbStart, rowCountStart
    if (!t.fixtureCtx.isVR) {
      breadcrumbStart = await this.getbreadcrumb()
      rowCountStart = await this.getContentRowCount('Before')
    }
    await this.openActionMenu()

    if (t.fixtureCtx.isVR)
      await t.fixtureCtx.vr.takeScreenshotAndUpload({
        screenshotPath: screenshotPath,
        withMask: withMask
      })

    await isExistingAndVisible('selectors.btnAddFolder')
    await t.click(selectors.btnAddFolder)

    if (!t.fixtureCtx.isVR) {
      const rowCountEnd = await this.getContentRowCount('After')
      await t.expect(rowCountEnd).eql(rowCountStart + 1) //New content line appears
    }

    await isExistingAndVisible('selectors.foldersNamesInputs')
    await t
      .typeText(selectors.foldersNamesInputs, newFolderName)
      .pressKey('enter')
      .expect(selectors.foldersNamesInputs.exists)
      .notOk('Edition mode still on') //No folder in edition mode -> No input on page
      .expect(selectors.folderOrFileName.withText(newFolderName).exists)
      .ok(`No folder named ${newFolderName}`)

    if (!t.fixtureCtx.isVR) {
      const breadcrumbEnd = await this.getbreadcrumb()
      await t.expect(breadcrumbEnd).eql(breadcrumbStart)
    }
  }

  //@param {String Array} files: path to files to upload.
  async uploadFiles(files) {
    const numOfFiles = files.length
    let rowCountStart
    if (!t.fixtureCtx.isVR)
      rowCountStart = await this.getContentRowCount('Before Upload')

    logger.info(`Uploading ${numOfFiles} file(s)`)

    await t
      .expect(selectors.btnUpload.exists)
      .ok(`selectors.btnUpload doesnt exist`)
    await t.setFilesToUpload(selectors.btnUpload, files)

    await isExistingAndVisible('selectors.divUpload')

    for (let i = 0; i < numOfFiles; i++) {
      const fileNameChunks = files[i].split('/')
      const fileName = fileNameChunks[fileNameChunks.length - 1]
      await isExistingAndVisible(
        `selectors.uploadedItem('${fileName}')`,
        selectors.uploadedItem(fileName)
      )
      await t
        //hasClass doesn't support [class*='upload-queue-item--done'], only full class name, so we cannot use it
        .expect(selectors.uploadedItem(fileName).getAttribute('class'))
        .contains('upload-queue-item--done')
    }

    if (!t.fixtureCtx.isVR) {
      // When uploading one file, check for the alert wrapper. When there are lots of files to upload, it already disappear once we finish checking each line
      if (numOfFiles == 1) {
        await isExistingAndVisible('selectors.alertWrapper')
      }
      await isExistingAndVisible('selectors.divUploadSuccess')
      await t
        .expect(selectors.divUpload.child('h4').innerText)
        .match(
          new RegExp('([' + numOfFiles + '].*){2}'),
          'Numbers of files uploaded does not match'
        )

      const rowCountEnd = await this.getContentRowCount('After')
      await t.expect(rowCountEnd).eql(rowCountStart + numOfFiles) //New content line appears
    }
  }

  async shareFolderPublicLink() {
    await isExistingAndVisible('selectors.toolbarDrive')
    await isExistingAndVisible(`selectors.btnShare`)
    await t.click(selectors.btnShare)
    await isExistingAndVisible('selectors.divShareByLink')
    await isExistingAndVisible('selectors.toggleShareLink')
    await t
      .click(selectors.toggleShareLink)
      .expect(selectors.toggleShareLink.find('input').checked)
      .ok(`selectors.toggleShareLink.find('input') is unchecked`)
      .expect(selectors.spanLinkCreating.exist)
      .notOk('selectors.spanLinkCreating still exists')
    await isExistingAndVisible('selectors.btnCopyShareByLink')

    await overwriteCopyCommand()

    await t
      .click(selectors.btnCopyShareByLink)
      .expect(getLastExecutedCommand())
      .eql('copy') //check link copy actually happens

    await isExistingAndVisible('selectors.alertWrapper')
  }

  async unshareFolderPublicLink() {
    await isExistingAndVisible('selectors.toolbarDrive')
    await isExistingAndVisible(`selectors.btnShareByMe`)
    await t.click(selectors.btnShareByMe)
    await isExistingAndVisible('selectors.divShareByLink')
    await isExistingAndVisible('selectors.toggleShareLink')
    await t
      .click(selectors.toggleShareLink)
      .expect(selectors.toggleShareLink.find('input').checked)
      .notOk(`selectors.toggleShareLink.find('input') is checked`)
      .expect(selectors.btnCopyShareByLink.exists)
      .notOk('selectors.btnCopyShareByLink still exists')
      .pressKey('esc')
      .expect(selectors.btnShareByMe.exists)
      .notOk('selectors.btnShareByMe.exists still exists')

    await isExistingAndVisible(`selectors.btnShare`)
  }

  async shareFirstFilePublicLink() {
    await this.selectElements([0])

    await t.click(selectors.btnShareCozySelectionBar)
    await isExistingAndVisible('selectors.divShareByLink')
    await isExistingAndVisible('selectors.toggleShareLink')
    await t
      .click(selectors.toggleShareLink)
      .expect(selectors.toggleShareLink.find('input').checked)
      .ok(`selectors.toggleShareLink.find('input') is unchecked`)
      .expect(selectors.spanLinkCreating.exist)
      .notOk('selectors.spanLinkCreating still exists')
    await isExistingAndVisible('selectors.btnCopyShareByLink')

    await overwriteCopyCommand()

    await t
      .click(selectors.btnCopyShareByLink)
      .expect(getLastExecutedCommand())
      .eql('copy') //check link copy actually happens

    await isExistingAndVisible('selectors.alertWrapper')
    await isExistingAndVisible(
      'selectors.shareBadgeForRowindex(0)',
      selectors.shareBadgeForRowindex(0)
    )
  }

  async unshareFirstFilePublicLink() {
    await this.selectElements([0])
    await isExistingAndVisible(
      'selectors.shareBadgeForRowindex(0)',
      selectors.shareBadgeForRowindex(0)
    )
    //check the bagge after selecting the 1st row, as `selectElements` already check await isExistingAndVisible(1st row)

    await t.click(selectors.btnShareCozySelectionBar)
    await isExistingAndVisible('selectors.divShareByLink')
    await isExistingAndVisible('selectors.toggleShareLink')
    await t
      .click(selectors.toggleShareLink)
      .expect(selectors.toggleShareLink.find('input').checked)
      .notOk(`selectors.toggleShareLink.find('input') is checked`)
      .expect(selectors.btnCopyShareByLink.exists)
      .notOk('selectors.btnCopyShareByLink still exists')
      .pressKey('esc')
      .expect(selectors.shareBadgeForRowindex(0).exists)
      .notOk('selectors.shareBadgeForRowindex(0) still exists')
  }

  //@param { Array } filesIndexArray : Array of files index
  async deleteElementsByIndex(filesIndexArray) {
    let rowCountStart
    if (!t.fixtureCtx.isVR) {
      rowCountStart = await this.getContentRowCount('Before')
    }
    await this.selectElements(filesIndexArray)

    await t
      .click(selectors.btnRemoveCozySelectionBar)
      .expect(selectors.modalFooter.visible)
      .ok('selectors.modalFooter does not show up')
      .click(selectors.btnModalSecondButton)
    if (!t.fixtureCtx.isVR) {
      const rowCountEnd = await this.getContentRowCount('After')
      await t.expect(rowCountEnd).eql(rowCountStart - filesIndexArray.length)
    }
  }

  //@param {string} fileName : file name to delete
  //this function could be improve to use an Array of filename, if needed
  async deleteElementByName(fileName) {
    const index = await this.getElementIndex(fileName)

    logger.debug(`index : ${index}`)
    await this.deleteElementsByIndex([index])
  }

  //@param { path } screenshotPath
  //@param { mask } withMask
  async deleteCurrentFolder({
    screenshotPath: screenshotPath,
    withMask = false
  }) {
    let partialBreacrumbStart
    if (!t.fixtureCtx.isVR) {
      partialBreacrumbStart = await selectors.breadcrumb.child(0).innerText //We want only the 1st part of the breadcrumb to get the parent folder, so we cannot use getbreadcrumb()
      partialBreacrumbStart = partialBreacrumbStart.replace(
        /(\r\n|\n|\r)/gm,
        ''
      ) //!FIXME  https://trello.com/c/lYUkc8jV/1667-drive-breadcrumb-n-sur-mac-chrome-only
    }
    await this.openActionMenu()
    await t.click(selectors.btnRemoveFolder)
    await isExistingAndVisible('selectors.modalFooter')

    if (t.fixtureCtx.isVR)
      //dates show up here, so there is a mask for screenshots
      await t.fixtureCtx.vr.takeScreenshotAndUpload({
        screenshotPath: screenshotPath,
        withMask: withMask
      })

    await t.click(selectors.btnModalSecondButton)
    await isExistingAndVisible('selectors.alertWrapper')

    await this.waitForLoading()
    if (!t.fixtureCtx.isVR) {
      const breadcrumbEnd = await this.getbreadcrumb()
      await t.expect(breadcrumbEnd).eql(partialBreacrumbStart)
    }
  }

  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param { integer } index : file/folder index
  //@param {String} newName : new name for file/folder
  //@param {bool} : exitWithEnter
  async renameElementsByIndex({
    index: index,
    newName: newName,
    exitWithEnter: exitWithEnter,
    screenshotPath: screenshotPath,
    withMask = false
  }) {
    await this.selectElements([index])

    await t.click(selectors.btnRenameCozySelectionBar)
    await isExistingAndVisible('selectors.foldersNamesInputs')
    //dates shows up here, so there is a mask for screenshots
    await t.fixtureCtx.vr.takeScreenshotAndUpload({
      screenshotPath: `${screenshotPath}-rename1`,
      withMask: withMask
    })

    await t.typeText(selectors.foldersNamesInputs, `${newName}`, {
      replace: true
    })
    exitWithEnter
      ? await t.pressKey('enter')
      : await t.click(selectors.contentTable)
    await t
      .expect(selectors.foldersNamesInputs.exists)
      .notOk(
        'selectors.foldersNamesInputs still exists - Edition mode still on'
      ) //No folder in edition mode -> No input on page
      .expect(selectors.folderOrFileName.withText(`${newName}`).exists)
      .ok(`selectors.folderOrFileName.withText(${newName}) doesnt exists`)
  }

  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param {string} elementName : file/folder name to rename
  //@param {string} newName : file/folder new name
  //@param {bool} : exitWithEnter
  async renameElementByName({
    elementName: elementName,
    newName: newName,
    exitWithEnter: exitWithEnter,
    screenshotPath: screenshotPath,
    withMask = false
  }) {
    const index = await this.getElementIndex(elementName)
    await this.renameElementsByIndex({
      index: index,
      newName: newName,
      exitWithEnter: exitWithEnter,
      screenshotPath: screenshotPath,
      withMask: withMask
    })
  }

  //@param { integer } index :  file index
  async clickOnActionMenuforFile(index) {
    await isExistingAndVisible(
      `selectors.contentRows.nth(${index})`,
      selectors.contentRows.nth(index)
    )

    await isExistingAndVisible(
      `selectors.elementActionMenuByRowIndex(${index})`,
      selectors.elementActionMenuByRowIndex(index)
    )
    await t.click(selectors.elementActionMenuByRowIndex(index))

    await isExistingAndVisible('selectors.actionMenuInner')
  }

  //@param {string} fileName : file/folder on which to click on action menu
  async clickOnActionMenuforElementName(fileName) {
    const index = await this.getElementIndex(fileName)
    await this.clickOnActionMenuforFile(index)
  }

  //@param {string} fileName : file/folder to move
  async showMoveModalForElement(elementToMove) {
    await this.clickOnActionMenuforElementName(elementToMove)
    await t.click(selectors.btnMoveToActionMenu)
    await isExistingAndVisible('selectors.modalContent')
    await this.waitForLoading()
  }

  //@param {string} destinationFolder : Folder name
  async moveElementTo(destinationFolder) {
    await this.goToBaseFolder(true)
    await this.goToFolder(destinationFolder, true)

    await isExistingAndVisible('selectors.btnModalSecondButton')

    await t.click(selectors.btnModalSecondButton)
  }

  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param { mask } withmask for screenshot
  async emptyTrash({ screenshotPath: screenshotPath, withMask = false }) {
    await isExistingAndVisible('selectors.toolbarTrash')
    await isExistingAndVisible('selectors.btnEmptyTrash')
    await t.click(selectors.btnEmptyTrash)
    await t.fixtureCtx.vr.takeScreenshotAndUpload({
      screenshotPath: `${screenshotPath}-emptyTrash`,
      withMask: withMask
    })
    await t
      .expect(selectors.modalFooter.visible)
      .ok('selectors.modalFooter does not show up')
      .click(selectors.btnModalSecondButton)
  }

  async typeInSearchInput(text) {
    await isExistingAndVisible('selectors.searchInput')
    await t.typeText(selectors.searchInput, text, { speed: 0.5 })
  }

  async checkSearchResultCount(expectResultsCount) {
    await isExistingAndVisible(`selectors.searchResult`)
    const resultsCount = await selectors.searchResult.count
    logger.debug(`resultsCount : ${resultsCount}`)
    await t.expect(resultsCount).eql(expectResultsCount)
  }

  async openSearchResultByIndex(index) {
    await isExistingAndVisible(
      `selectors.searchResult.sibling(${index})`,
      selectors.searchResult.sibling(index)
    )
    await t.click(selectors.searchResult(index))
  }
}
