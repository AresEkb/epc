package epc.text.formatting2

import epc.Model
import epc.ModelElement
import org.eclipse.xtext.formatting2.AbstractFormatter2
import org.eclipse.xtext.formatting2.IFormattableDocument

class EpcFormatter extends AbstractFormatter2 {

//    @Inject extension EpcGrammarAccess
//
//    EpcGrammarAccess g;

    def dispatch void format(Model stmt, extension IFormattableDocument document) {
//        println('!!!')
//        println(stmt)

        // HACK: https://www.eclipse.org/forums/index.php/t/1090237/
//        stmt.regionFor.keyword(modelAccess.leftCurlyBracketKeyword_3).append[newLine]
//        stmt.regionFor.keyword(modelAccess.rightCurlyBracketKeyword_8).prepend[newLine]
//        stmt.regionFor.keyword(modelAccess.leftCurlyBracketKeyword_6_1).append[newLine]
//        stmt.regionFor.keyword(modelAccess.rightCurlyBracketKeyword_6_4).prepend[newLine].append[newLine]
//        stmt.regionFor.keyword(modelAccess.leftCurlyBracketKeyword_7_1).append[newLine]
//        stmt.regionFor.keyword(modelAccess.rightCurlyBracketKeyword_7_4).prepend[newLine]
//        interior(
//            stmt.regionFor.keyword(modelAccess.leftCurlyBracketKeyword_3),
//            stmt.regionFor.keyword(modelAccess.rightCurlyBracketKeyword_8)
//        )[indent]
//        interior(
//            stmt.regionFor.keyword(modelAccess.leftCurlyBracketKeyword_6_1),
//            stmt.regionFor.keyword(modelAccess.rightCurlyBracketKeyword_6_4)
//        )[indent]
//        interior(
//            stmt.regionFor.keyword(modelAccess.leftCurlyBracketKeyword_7_1),
//            stmt.regionFor.keyword(modelAccess.rightCurlyBracketKeyword_7_4)
//        )[indent]

//        stmt.regionFor.keyword('{').prepend[oneSpace].append[newLine]
//        stmt.regionFor.keyword('}').prepend[newLine].append[newLine]
//        stmt.regionFor.keyword('Description').prepend[space = '  ']
//        stmt.regionFor.keyword('Version').prepend[space = '  ']
//        stmt.regionFor.feature(EpcPackage.Literals.MODEL__DESCRIPTION).append[newLine]
//        stmt.regionFor.feature(EpcPackage.Literals.MODEL__VERSION).append[newLine]
        interior(
            stmt.regionFor.keyword('{').prepend[oneSpace].append[newLine],
            stmt.regionFor.keyword('}').prepend[newLine].append[newLine]
        )[indent]
//        stmt.interior[indent]
////   	 	stmt.regionFor.feature(EpcPackage.Literals.MODEL__ELEMENTS).prepend[indent]
////g.findKeywordPairs('{', '}')
//        for (f : stmt.regionFor.features(EpcPackage.Literals.MODEL__ELEMENTS)) {
//            f.prepend[indent]
//        }
//        for (k : stmt.regionFor.keywords("{")) {
//            k.prepend[oneSpace].append[newLine]
//        }
//        for (k : stmt.regionFor.keywords("}")) {
//            k.prepend[newLine].append[newLine]
//        }
//        for (k : stmt.regionFor.keywords(",")) {
//            k.prepend[noSpace].append[newLine]
//        }

//		stmt.regionFor.keyword("{").prepend[oneSpace].append[newLine]
//		stmt.regionFor.keyword("}").prepend[newLine].append[newLine]

        for (element : stmt.elements) {
//            element.prepend[indent]
//            element.append[newLine]
            element.format(document)
        }

//        for (element : stmt.connections) {
//            element.prepend[indent]
//        }
    }

    def dispatch void format(ModelElement stmt, extension IFormattableDocument document) {
        println('!!!')
        println(stmt)
//        stmt.prepend[space = '  '].append[newLine]
        stmt.prepend[indent].append[newLine]
    }

//    def dispatch format(ControlFlow stmt, extension IFormattableDocument document) {
//        println('!!!')
//        println(stmt)
//        stmt.regionFor.feature(EpcPackage.Literals.CONNECTION__SOURCE).surround[oneSpace]
//        stmt.regionFor.feature(EpcPackage.Literals.CONNECTION__TARGET).prepend[oneSpace].append[noSpace]
//    }

//    def dispatch format(InformationFlow stmt, extension IFormattableDocument document) {
//        stmt.regionFor.keyword("[").surround[noSpace]
//        stmt.regionFor.keyword("]").prepend[noSpace].append[oneSpace]
//        stmt.regionFor.feature(EpcPackage.Literals.CONNECTION__SOURCE).surround[oneSpace]
//        stmt.regionFor.feature(EpcPackage.Literals.CONNECTION__TARGET).prepend[oneSpace].append[noSpace]
//    }

}
