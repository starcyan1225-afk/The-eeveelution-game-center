// ===== PIXEL ART CREATOR APPLICATION =====

// State management
const state = {
    currentUser: null,
    gridSize: 24,
    pixelData: [],
    history: [],
    currentColor: 'rgb(255, 100, 200)',
    currentBrush: 'normal',
    savedArtworks: {}
};

// Detailed color palette for realistic Eeveelutions
const colors = {
    // Eevee
    eevee_fur1: 'rgb(210, 160, 100)',
    eevee_fur2: 'rgb(190, 140, 80)',
    eevee_fur3: 'rgb(170, 120, 60)',
    eevee_belly: 'rgb(240, 200, 140)',
    
    // Vaporeon
    vaporeon_body: 'rgb(100, 160, 220)',
    vaporeon_body2: 'rgb(80, 140, 200)',
    vaporeon_body3: 'rgb(60, 120, 180)',
    vaporeon_accent: 'rgb(150, 200, 240)',
    
    // Jolteon
    jolteon_body: 'rgb(255, 230, 100)',
    jolteon_body2: 'rgb(240, 210, 80)',
    jolteon_body3: 'rgb(220, 190, 60)',
    jolteon_accent: 'rgb(255, 245, 150)',
    
    // Flareon
    flareon_body: 'rgb(255, 140, 80)',
    flareon_body2: 'rgb(240, 120, 60)',
    flareon_body3: 'rgb(220, 100, 40)',
    flareon_accent: 'rgb(255, 180, 120)',
    
    // Espeon
    espeon_body: 'rgb(200, 150, 230)',
    espeon_body2: 'rgb(180, 130, 210)',
    espeon_body3: 'rgb(160, 110, 190)',
    espeon_accent: 'rgb(230, 200, 255)',
    
    // Umbreon
    umbreon_body: 'rgb(60, 50, 100)',
    umbreon_body2: 'rgb(40, 30, 80)',
    umbreon_body3: 'rgb(20, 10, 60)',
    umbreon_gold: 'rgb(255, 200, 80)',
    
    // Leafeon
    leafeon_body: 'rgb(120, 180, 100)',
    leafeon_body2: 'rgb(100, 160, 80)',
    leafeon_body3: 'rgb(80, 140, 60)',
    leafeon_accent: 'rgb(150, 210, 130)',
    
    // Glaceon
    glaceon_body: 'rgb(150, 210, 255)',
    glaceon_body2: 'rgb(120, 190, 240)',
    glaceon_body3: 'rgb(100, 170, 220)',
    glaceon_accent: 'rgb(200, 240, 255)',
    
    // Sylveon
    sylveon_body: 'rgb(220, 180, 220)',
    sylveon_body2: 'rgb(200, 160, 200)',
    sylveon_body3: 'rgb(180, 140, 180)',
    sylveon_ribbon: 'rgb(255, 100, 180)',
    
    // Common
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    eye_white: 'rgb(240, 240, 240)',
    skin: 'rgb(255, 220, 180)',
    transparent: 'transparent'
};

// Eeveelution patterns (48x48 for high detail)
const eeveelutionPatterns = {
    'Eevee': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '................................................',
            '........................EE........................',
            '......................EEEEEE........................',
            '....................EEEEEEEEE....................',
            '...................EEEEEE1EEEEE...................',
            '.................EEEEE11111EEEEE.................',
            '................EEEE111111111EEEE................',
            '...............EEEE11121111221EEEE...............',
            '..............EEE211W1W11W11W12EEEE..............',
            '..............EE212W2W11W11W212EEEE..............',
            '.............EEE2222221111222222EEEE.............',
            '.............EEE2222211111222222EEEE.............',
            '............EEEE2222211111222222EEEEE............',
            '...........EEEEEE222222222222EEEEEEEE...........',
            '..........EEEEEEEEE2222222EEEEEEEEEEE..........',
            '.........EEEEEEEEEEEE11EEEEEEEEEEEEEEE.........',
            '........EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE........',
            '.......EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.......',
            '.......EEEEEEEEE3333333333EEEEEEEEEEEEE.......',
            '.......EEEEEE333333333333333EEEEEEEEE........',
            '.......EEEEE3333333333333333EEEEEEEE........',
            '.......EEEE33333FFFFFFFF33333EEEEEE........',
            '.......EEE3333FFFFFFFFFFFFF3333EEE........',
            '.......EE3333FFFFFFFFFFFFF33333EE........',
            '.......EE333FFFFFFFFFFFFFFFF333EE........',
            '.......EE333FFFFFFFFFFFFFFFF333EE........',
            '.......EE333FFFFFFFFFFFFFFFF333EE........',
            '.......EE333FFFFFFFFFFFFFFF333EE.........',
            '......EEE33FFFFFFFFFFFFFFEF33EEE........',
            '......EEE33FFFFFFFFFFFFFFFF33EEE........',
            '......EEE33FFFFFFFFFFFFFFFF33EEE........',
            '.......EE33FFFFFFFFFFFFFFFFFF33EE.......',
            '.......EE33FFFFFFFFFFFFFFFF333EE.......',
            '.......EE333FFFFFFFFFFFFFFFF333EE......',
            '.......EE3333FFFFFFFFFFFFF3333EE......',
            '.......EE33333FFFFFFFFFF333333EE......',
            '.......EEE333333FFFFFFFF333333EEE.....',
            '.......EEEE33333333333333333EEEEE.....',
            '.......EEEEE333333333333333EEEEEE....',
            '.......EEEEEE33333333333EEEEEEEEE...',
            '.......EEEEEEEEE33333EEEEEEEEEEEEE..',
            '.......EEEEEEEEEEEEEEEEEEEEEEEEEEEE.',
            '.......EEEEEEEEEEEEEEEEEEEEEEEEEEEE.',
            '........EEEEEEEEEEEEEEEEEEEEEEEEEE..',
            '........EEEEEEEEEEEEEEEEEEEEEEEEE...',
            '........EEEEEEEEEEEEEEEEEEEEEEE....'
        ],
        colorMap: {
            'E': colors.eevee_fur1,
            '1': colors.eevee_fur2,
            '2': colors.eevee_fur3,
            '3': colors.eevee_belly,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Vaporeon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................VV........................',
            '......................VVVVVV........................',
            '....................VVVVVVVVV....................',
            '...................VVVVVV2VVVVV...................',
            '.................VVVVV222222VVVVV.................',
            '................VVVV22222222222VVVV................',
            '...............VVVV22122222122VVVV...............',
            '..............VVV122W1W222W1W122VVVV..............',
            '..............VV122W2W222W2W122VVVV..............',
            '.............VVV22222222222222VVVVV.............',
            '.............VVV22222222222222VVVVV.............',
            '............VVVV22222222222222VVVVVV............',
            '...........VVVVVV22222222222VVVVVVVV...........',
            '..........VVVVVVVVV2222222VVVVVVVVVV..........',
            '.........VVVVVVVVVVVV22VVVVVVVVVVVVVV.........',
            '........VVVVVVVVVVVVVVVVVVVVVVVVVVVVVV........',
            '.......VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV.......',
            '.......VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV.......',
            '.......VVVVVVVVVAAAAAAAAAAVVVVVVVVVVV.......',
            '.......VVVVVVAAA99999999999AAVVVVVVV........',
            '.......VVVVV99999999999999999VVVVVV........',
            '.......VVVV999999999FFFFFFF999VVVVVV........',
            '.......VVV99999FFFFFFFFFFFFF999VVV........',
            '.......VV9999FFFFFFFFFFFFF99999VV........',
            '.......VV999FFFFFFFFFFFFFFFF999VV........',
            '.......VV999FFFFFFFFFFFFFFFF999VV........',
            '.......VV999FFFFFFFFFFFFFFFF999VV........',
            '.......VV999FFFFFFFFFFFFFFF999VV.........',
            '......VVV99FFFFFFFFFFFFFFEF99VVVV........',
            '......VVV99FFFFFFFFFFFFFFFF99VVVV........',
            '......VVV99FFFFFFFFFFFFFFFF99VVVV........',
            '.......VV99FFFFFFFFFFFFFFFFFF99VV.......',
            '.......VV99FFFFFFFFFFFFFFFF999VV.......',
            '.......VV999FFFFFFFFFFFFFFFF999VV......',
            '.......VV9999FFFFFFFFFFFFF9999VV......',
            '.......VV99999FFFFFFFFFF999999VV......',
            '.......VVV999999FFFFFFFF999999VVV.....',
            '.......VVVV99999999999999999VVVVV.....',
            '.......VVVVV999999999999999VVVVVV....',
            '.......VVVVVV99999999999VVVVVVVVV...',
            '.......VVVVVVVVV99999VVVVVVVVVVVVV..',
            '.......VVVVVVVVVVVVVVVVVVVVVVVVVVVV.',
            '.......VVVVVVVVVVVVVVVVVVVVVVVVVVVV.',
            '........VVVVVVVVVVVVVVVVVVVVVVVVVVV..',
            '........VVVVVVVVVVVVVVVVVVVVVVVVVV...',
            '........VVVVVVVVVVVVVVVVVVVVVVVV....'
        ],
        colorMap: {
            'V': colors.vaporeon_body,
            '2': colors.vaporeon_body2,
            'A': colors.vaporeon_accent,
            '9': colors.vaporeon_body3,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Jolteon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '..........................JJ...................',
            '........................JJJJJJ...................',
            '.......................JJJJJJJJ.................',
            '......................JJJJ2JJJJJ.................',
            '.....................JJJJ222222JJJ...............',
            '....................JJJ222222222JJJ..............',
            '..................JJJ2222222222222JJJ............',
            '................JJJJJ22122222122222JJ............',
            '...............JJJJJ122W1W222W1W122JJ............',
            '..............JJJJJ122W2W222W2W122JJJ............',
            '.............JJJJJJ2222222222222222JJJJ..........',
            '............JJJJJJJJ222222222222222JJJJJ.........',
            '...........JJJJJJJJJJ222222222222JJJJJJJ.........',
            '..........JJJJJJJJJJJJJ2222222JJJJJJJJJJ.........',
            '.........JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ.........',
            '........JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ........',
            '.......JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ.......',
            '.......JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ.......',
            '.......JJJJJJJJAAAAAAAAJJJJJJJJJJJJJJJ.......',
            '.......JJJJJJAA99999999999AAJJJJJJJJJ........',
            '.......JJJJJ99999999999999999JJJJJJJ........',
            '.......JJJJ999999999FFFFFFF999JJJJJJ........',
            '.......JJJ99999FFFFFFFFFFFFF999JJJ........',
            '.......JJ9999FFFFFFFFFFFFF99999JJ........',
            '.......JJ999FFFFFFFFFFFFFFFF999JJ........',
            '.......JJ999FFFFFFFFFFFFFFFF999JJ........',
            '.......JJ999FFFFFFFFFFFFFFFF999JJ........',
            '.......JJ999FFFFFFFFFFFFFFF999JJ.........',
            '......JJJ99FFFFFFFFFFFFFFEF99JJJJ........',
            '......JJJ99FFFFFFFFFFFFFFFF99JJJJ........',
            '......JJJ99FFFFFFFFFFFFFFFF99JJJJ........',
            '.......JJ99FFFFFFFFFFFFFFFFFF99JJ.......',
            '.......JJ99FFFFFFFFFFFFFFFF999JJ.......',
            '.......JJ999FFFFFFFFFFFFFFFF999JJ......',
            '.......JJ9999FFFFFFFFFFFFF9999JJ......',
            '.......JJ99999FFFFFFFFFF999999JJ......',
            '.......JJJ999999FFFFFFFF999999JJJ.....',
            '.......JJJJ99999999999999999JJJJJ.....',
            '.......JJJJJ999999999999999JJJJJJ....',
            '.......JJJJJJ99999999999JJJJJJJJJ...',
            '.......JJJJJJJJJ99999JJJJJJJJJJJJJ..',
            '.......JJJJJJJJJJJJJJJJJJJJJJJJJJJJ.',
            '.......JJJJJJJJJJJJJJJJJJJJJJJJJJJJ.',
            '........JJJJJJJJJJJJJJJJJJJJJJJJJJJ..',
            '........JJJJJJJJJJJJJJJJJJJJJJJJJJ...',
            '........JJJJJJJJJJJJJJJJJJJJJJJJ....'
        ],
        colorMap: {
            'J': colors.jolteon_body,
            '2': colors.jolteon_body2,
            'A': colors.jolteon_accent,
            '9': colors.jolteon_body3,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Flareon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................FF........................',
            '......................FFFFFF........................',
            '....................FFFFFFFFF....................',
            '...................FFFFFF2FFFF....................',
            '.................FFFFF222222FFFFF.................',
            '................FFFF22222222222FFF................',
            '...............FFFF22122222122FFFF...............',
            '..............FFF122W1W222W1W122FFFF..............',
            '..............FF122W2W222W2W122FFFF..............',
            '.............FFF22222222222222FFFFF.............',
            '.............FFF22222222222222FFFFF.............',
            '............FFFF22222222222222FFFFFF............',
            '...........FFFFFF22222222222FFFFFFFFFF...........',
            '..........FFFFFFFFF2222222FFFFFFFFFFFFF..........',
            '.........FFFFFFFFFF22FFFFFFFFFFFFFFFFFF.........',
            '........FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF........',
            '.......FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF.......',
            '.......FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF.......',
            '.......FFFFFFFFFF3333333333FFFFFFFFFF.......',
            '.......FFFFFFFF333333333333333FFFFFFFFF........',
            '.......FFFFFF3333333333333333FFFFFFFF........',
            '.......FFFFF3333333FFFFFFF3333FFFFFFFF........',
            '.......FFFF3333FFFFFFFFFFFFF3333FFFF........',
            '.......FFF3333FFFFFFFFFFFFF33333FFF........',
            '.......FFF333FFFFFFFFFFFFFFFF333FFF........',
            '.......FFF333FFFFFFFFFFFFFFFF333FFF........',
            '.......FFF333FFFFFFFFFFFFFFFF333FFF........',
            '.......FFF333FFFFFFFFFFFFFFF333FFF.........',
            '......FFFF33FFFFFFFFFFFFFFEF33FFFFFFFF........',
            '......FFFF33FFFFFFFFFFFFFFFF33FFFFFFFF........',
            '......FFFF33FFFFFFFFFFFFFFFF33FFFFFFFF........',
            '.......FF33FFFFFFFFFFFFFFFFFF33FF.......',
            '.......FF33FFFFFFFFFFFFFFFF333FF.......',
            '.......FF333FFFFFFFFFFFFFFFF333FF......',
            '.......FF3333FFFFFFFFFFFFF3333FF......',
            '.......FF33333FFFFFFFFFF333333FF......',
            '.......FFF333333FFFFFFFF333333FFF.....',
            '.......FFFF33333333333333333FFFFF.....',
            '.......FFFFF333333333333333FFFFFF....',
            '.......FFFFFF33333333333FFFFFFF....',
            '.......FFFFFFFF333333FFFFFFFFFF..',
            '.......FFFFFFFFFFFFFFFFFFFFFFFFFFFF.',
            '.......FFFFFFFFFFFFFFFFFFFFFFFFFFFF.',
            '........FFFFFFFFFFFFFFFFFFFFFFFFFF..',
            '........FFFFFFFFFFFFFFFFFFFFFFFFFFF...',
            '........FFFFFFFFFFFFFFFFFFFFFFFF....'
        ],
        colorMap: {
            'F': colors.flareon_body,
            '2': colors.flareon_body2,
            '3': colors.flareon_body3,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Espeon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................EE........................',
            '......................EEEEEE........................',
            '....................EEEEEEEEE....................',
            '...................EEEEEE1EEEEE...................',
            '.................EEEEE11111EEEEE.................',
            '................EEEE111111111EEEE................',
            '...............EEEE11121111221EEEE...............',
            '..............EEE211W1W11W11W12EEEE..............',
            '..............EE212W2W11W11W212EEEE..............',
            '.............EEE2222221111222222EEEE.............',
            '.............EEE2222211111222222EEEE.............',
            '............EEEE2222211111222222EEEEE............',
            '...........EEEEEE222222222222EEEEEEEE...........',
            '..........EEEEEEEEE2222222EEEEEEEEEEE..........',
            '.........EEEEEEEEEEEE11EEEEEEEEEEEEEEE.........',
            '........EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE........',
            '.......EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.......',
            '.......EEEEEEEEE3333333333EEEEEEEEEEEEE.......',
            '.......EEEEEE333333333333333EEEEEEEEE........',
            '.......EEEEE3333333333333333EEEEEEEE........',
            '.......EEEE33333FFFFFFFF33333EEEEEE........',
            '.......EEE3333FFFFFFFFFFFFF3333EEE........',
            '.......EE3333FFFFFFFFFFFFF33333EE........',
            '.......EE333FFFFFFFFFFFFFFFF333EE........',
            '.......EE333FFFFFFFFFFFFFFFF333EE........',
            '.......EE333FFFFFFFFFFFFFFFF333EE........',
            '.......EE333FFFFFFFFFFFFFFF333EE.........',
            '......EEE33FFFFFFFFFFFFFFEF33EEE........',
            '......EEE33FFFFFFFFFFFFFFFF33EEE........',
            '......EEE33FFFFFFFFFFFFFFFF33EEE........',
            '.......EE33FFFFFFFFFFFFFFFFFF33EE.......',
            '.......EE33FFFFFFFFFFFFFFFF333EE.......',
            '.......EE333FFFFFFFFFFFFFFFF333EE......',
            '.......EE3333FFFFFFFFFFFFF3333EE......',
            '.......EE33333FFFFFFFFFF333333EE......',
            '.......EEE333333FFFFFFFF333333EEE.....',
            '.......EEEE33333333333333333EEEEE.....',
            '.......EEEEE333333333333333EEEEEE....',
            '.......EEEEEE33333333333EEEEEEEEE...',
            '.......EEEEEEEEE33333EEEEEEEEEEEEE..',
            '.......EEEEEEEEEEEEEEEEEEEEEEEEEEEE.',
            '.......EEEEEEEEEEEEEEEEEEEEEEEEEEEE.',
            '........EEEEEEEEEEEEEEEEEEEEEEEEEE..',
            '........EEEEEEEEEEEEEEEEEEEEEEEEE...',
            '........EEEEEEEEEEEEEEEEEEEEEEE....'
        ],
        colorMap: {
            'E': colors.espeon_body,
            '1': colors.espeon_body2,
            '2': colors.espeon_body3,
            '3': colors.espeon_accent,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Umbreon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................UU........................',
            '......................UUUUUU........................',
            '....................UUUUUUUUU....................',
            '...................UUUUUU1UUUU....................',
            '.................UUUUU111111UUUU.................',
            '................UUUU111111111UUUU................',
            '...............UUUU11121111221UUUU...............',
            '..............UUU211W1W11W11W12UUUU..............',
            '..............UU212W2W11W11W212UUUU..............',
            '.............UUU2222221111222222UUUU.............',
            '.............UUU2222211111222222UUUU.............',
            '............UUUU2222211111222222UUUUU............',
            '...........UUUUUU222222222222UUUUUUUU...........',
            '..........UUUUUUUUU2222222UUUUUUUUUUU..........',
            '.........UUUUUUUUUUUU11UUUUUUUUUUUUUUU.........',
            '........UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU........',
            '.......UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU.......',
            '.......UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU.......',
            '.......UUUUUUUUGGGGGGGGGGUUUUUUUUUUUUU.......',
            '.......UUUUUUGGG99999999999GGUUUUUUUUU........',
            '.......UUUUU99999999999999999UUUUUUUU........',
            '.......UUUU999999999FFFFFFF999UUUUUU........',
            '.......UUU99999FFFFFFFFFFFFF999UUU........',
            '.......UU9999FFFFFFFFFFFFF99999UU........',
            '.......UU999FFFFFFFFFFFFFFFF999UU........',
            '.......UU999FFFFFFFFFFFFFFFF999UU........',
            '.......UU999FFFFFFFFFFFFFFFF999UU........',
            '.......UU999FFFFFFFFFFFFFFF999UU.........',
            '......UUU99FFFFFFFFFFFFFFEF99UUUU........',
            '......UUU99FFFFFFFFFFFFFFFF99UUUU........',
            '......UUU99FFFFFFFFFFFFFFFF99UUUU........',
            '.......UU99FFFFFFFFFFFFFFFFFF99UU.......',
            '.......UU99FFFFFFFFFFFFFFFF999UU.......',
            '.......UU999FFFFFFFFFFFFFFFF999UU......',
            '.......UU9999FFFFFFFFFFFFF9999UU......',
            '.......UU99999FFFFFFFFFF999999UU......',
            '.......UUU999999FFFFFFFF999999UUU.....',
            '.......UUUU99999999999999999UUUUU.....',
            '.......UUUUU999999999999999UUUUUU....',
            '.......UUUUUU99999999999UUUUUUUUU...',
            '.......UUUUUUUUU99999UUUUUUUUUUUUU..',
            '.......UUUUUUUUUUUUUUUUUUUUUUUUUUUU.',
            '.......UUUUUUUUUUUUUUUUUUUUUUUUUUUU.',
            '........UUUUUUUUUUUUUUUUUUUUUUUUUUU..',
            '........UUUUUUUUUUUUUUUUUUUUUUUUUU...',
            '........UUUUUUUUUUUUUUUUUUUUUUUU....'
        ],
        colorMap: {
            'U': colors.umbreon_body,
            '1': colors.umbreon_body2,
            '2': colors.umbreon_body3,
            'G': colors.umbreon_gold,
            '9': colors.umbreon_body2,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Leafeon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................LL........................',
            '......................LLLLLL........................',
            '....................LLLLLLLLL....................',
            '...................LLLLLL1LLLL....................',
            '.................LLLLL111111LLLL.................',
            '................LLLL111111111LLLL................',
            '...............LLLL11121111221LLLL...............',
            '..............LLL211W1W11W11W12LLLL..............',
            '..............LL212W2W11W11W212LLLL..............',
            '.............LLL2222221111222222LLLL.............',
            '.............LLL2222211111222222LLLL.............',
            '............LLLL2222211111222222LLLLL............',
            '...........LLLLLL222222222222LLLLLLLL...........',
            '..........LLLLLLLLL2222222LLLLLLLLLL..........',
            '.........LLLLLLLLLLLL11LLLLLLLLLLLLLL.........',
            '........LLLLLLLLLLLLLLLLLLLLLLLLLLLLL........',
            '.......LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL.......',
            '.......LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL.......',
            '.......LLLLLLLLL3333333333LLLLLLLLLL.......',
            '.......LLLLLL333333333333333LLLLLLLL........',
            '.......LLLLL3333333333333333LLLLLLL........',
            '.......LLLL33333FFFFFFFF33333LLLLLL........',
            '.......LLL3333FFFFFFFFFFFFF3333LLL........',
            '.......LL3333FFFFFFFFFFFFF33333LL........',
            '.......LL333FFFFFFFFFFFFFFFF333LL........',
            '.......LL333FFFFFFFFFFFFFFFF333LL........',
            '.......LL333FFFFFFFFFFFFFFFF333LL........',
            '.......LL333FFFFFFFFFFFFFFF333LL.........',
            '......LLL33FFFFFFFFFFFFFFEF33LLL........',
            '......LLL33FFFFFFFFFFFFFFFF33LLL........',
            '......LLL33FFFFFFFFFFFFFFFF33LLL........',
            '.......LL33FFFFFFFFFFFFFFFFFF33LL.......',
            '.......LL33FFFFFFFFFFFFFFFF333LL.......',
            '.......LL333FFFFFFFFFFFFFFFF333LL......',
            '.......LL3333FFFFFFFFFFFFF3333LL......',
            '.......LL33333FFFFFFFFFF333333LL......',
            '.......LLL333333FFFFFFFF333333LLL.....',
            '.......LLLL33333333333333333LLLLL.....',
            '.......LLLLL333333333333333LLLLLL....',
            '.......LLLLLL33333333333LLLLLLLLL...',
            '.......LLLLLLLLL33333LLLLLLLLLLLLL..',
            '.......LLLLLLLLLLLLLLLLLLLLLLLLLLLL.',
            '.......LLLLLLLLLLLLLLLLLLLLLLLLLLLL.',
            '........LLLLLLLLLLLLLLLLLLLLLLLLLL..',
            '........LLLLLLLLLLLLLLLLLLLLLLLLL...',
            '........LLLLLLLLLLLLLLLLLLLLLLL....'
        ],
        colorMap: {
            'L': colors.leafeon_body,
            '1': colors.leafeon_body2,
            '2': colors.leafeon_body3,
            '3': colors.leafeon_accent,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Glaceon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................GG........................',
            '......................GGGGGG........................',
            '....................GGGGGGGGG....................',
            '...................GGGGGG2GGGG....................',
            '.................GGGGG222222GGGG.................',
            '................GGGG222222222GGGG................',
            '...............GGGG22122222122GGGG...............',
            '..............GGG211W1W22W1W12GGGG..............',
            '..............GG212W2W22W2W212GGGG..............',
            '.............GGG2222222222222222GGGG.............',
            '.............GGG2222222222222222GGGG.............',
            '............GGGG2222222222222222GGGGG............',
            '...........GGGGGG222222222222GGGGGGGG...........',
            '..........GGGGGGGGG2222222GGGGGGGGGG..........',
            '.........GGGGGGGGGGGG22GGGGGGGGGGGGGG.........',
            '........GGGGGGGGGGGGGGGGGGGGGGGGGGGGG........',
            '.......GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.......',
            '.......GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.......',
            '.......GGGGGGGGG3333333333GGGGGGGGGGG.......',
            '.......GGGGGG333333333333333GGGGGGGGG........',
            '.......GGGGG3333333333333333GGGGGGGG........',
            '.......GGGG33333FFFFFFFF33333GGGGGG........',
            '.......GGG3333FFFFFFFFFFFFF3333GGG........',
            '.......GG3333FFFFFFFFFFFFF33333GG........',
            '.......GG333FFFFFFFFFFFFFFFF333GG........',
            '.......GG333FFFFFFFFFFFFFFFF333GG........',
            '.......GG333FFFFFFFFFFFFFFFF333GG........',
            '.......GG333FFFFFFFFFFFFFFF333GG.........',
            '......GGG33FFFFFFFFFFFFFFEF33GGG........',
            '......GGG33FFFFFFFFFFFFFFFF33GGG........',
            '......GGG33FFFFFFFFFFFFFFFF33GGG........',
            '.......GG33FFFFFFFFFFFFFFFFFF33GG.......',
            '.......GG33FFFFFFFFFFFFFFFF333GG.......',
            '.......GG333FFFFFFFFFFFFFFFF333GG......',
            '.......GG3333FFFFFFFFFFFFF3333GG......',
            '.......GG33333FFFFFFFFFF333333GG......',
            '.......GGG333333FFFFFFFF333333GGG.....',
            '.......GGGG33333333333333333GGGGG.....',
            '.......GGGGG333333333333333GGGGGG....',
            '.......GGGGGG33333333333GGGGGGGGG...',
            '.......GGGGGGGGG33333GGGGGGGGGGGGG..',
            '.......GGGGGGGGGGGGGGGGGGGGGGGGGGG.',
            '.......GGGGGGGGGGGGGGGGGGGGGGGGGGG.',
            '........GGGGGGGGGGGGGGGGGGGGGGGGG..',
            '........GGGGGGGGGGGGGGGGGGGGGGGG...',
            '........GGGGGGGGGGGGGGGGGGGGGG....'
        ],
        colorMap: {
            'G': colors.glaceon_body,
            '2': colors.glaceon_body2,
            '3': colors.glaceon_body3,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    },
    'Sylveon': {
        width: 48,
        height: 48,
        data: [
            '................................................',
            '................................................',
            '........................SS........................',
            '......................SSSSSS........................',
            '....................SSSSSSSSS....................',
            '...................SSSSSS1SSSS....................',
            '.................SSSSS111111SSSS.................',
            '................SSSS111111111SSSS................',
            '...............SSSS11121111221SSSS...............',
            '..............SSS211W1W11W11W12SSSS..............',
            '..............SS212W2W11W11W212SSSS..............',
            '.............SSS2222221111222222SSSS.............',
            '.............SSS2222211111222222SSSS.............',
            '............SSSS2222211111222222SSSSS............',
            '...........SSSSSS222222222222SSSSSSSS...........',
            '..........SSSSSSSSS2222222SSSSSSSSSSS..........',
            '.........SSSSSSSSSSSSS11SSSSSSSSSSSSS.........',
            '........SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS........',
            '.......SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS.......',
            '.......SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS.......',
            '.......SSSSSSSS3RRRRRRRRRRSSSSSSSSSSS.......',
            '.......SSSSS3RRR9999999999999RRSSSSSSS........',
            '.......SSSS99999999999999999999SSSSSSS........',
            '.......SSS999999999FFFFFFF999RSSSSSSS........',
            '.......SS9999FFFFFFFFFFFFF99999SS........',
            '.......SS999FFFFFFFFFFFFF99999SS........',
            '.......SS999FFFFFFFFFFFFFFFF999SS........',
            '.......SS999FFFFFFFFFFFFFFFF999SS........',
            '.......SS999FFFFFFFFFFFFFFFF999SS........',
            '.......SS999FFFFFFFFFFFFFFF999SS.........',
            '......SSS99FFFFFFFFFFFFFFEF99SSS........',
            '......SSS99FFFFFFFFFFFFFFFF99SSS........',
            '......SSS99FFFFFFFFFFFFFFFF99SSS........',
            '.......SS99FFFFFFFFFFFFFFFFFF99SS.......',
            '.......SS99FFFFFFFFFFFFFFFF999SS.......',
            '.......SS999FFFFFFFFFFFFFFFF999SS......',
            '.......SS9999FFFFFFFFFFFFF9999SS......',
            '.......SS99999FFFFFFFFFF999999SS......',
            '.......SSS999999FFFFFFFF999999SSS.....',
            '.......SSSS99999999999999999SSSSS.....',
            '.......SSSSS999999999999999SSSSSS....',
            '.......SSSSSS99999999999SSSSSSSSS...',
            '.......SSSSSSSSS99999SSSSSSSSSSSSS..',
            '.......SSSSSSSSSSSSSSSSSSSSSSSSSSS.',
            '.......SSSSSSSSSSSSSSSSSSSSSSSSSSS.',
            '........SSSSSSSSSSSSSSSSSSSSSSSSS..',
            '........SSSSSSSSSSSSSSSSSSSSSSSS...',
            '........SSSSSSSSSSSSSSSSSSSSSS....'
        ],
        colorMap: {
            'S': colors.sylveon_body,
            '1': colors.sylveon_body2,
            '2': colors.sylveon_body3,
            '3': colors.sylveon_ribbon,
            'R': colors.sylveon_ribbon,
            '9': colors.sylveon_body3,
            'F': colors.skin,
            'W': colors.eye_white,
            '.': colors.transparent
        }
    }
};

const eeveelutions = [
    { name: 'Eevee', emoji: '🐹' },
    { name: 'Vaporeon', emoji: '💧' },
    { name: 'Jolteon', emoji: '⚡' },
    { name: 'Flareon', emoji: '🔥' },
    { name: 'Espeon', emoji: '✨' },
    { name: 'Umbreon', emoji: '🌙' },
    { name: 'Leafeon', emoji: '🍃' },
    { name: 'Glaceon', emoji: '❄️' },
    { name: 'Sylveon', emoji: '🎀' }
];

// Initialize application
window.addEventListener('load', () => {
    loadUserData();
    updateLoginUI();
});

// ===== LOGIN SYSTEM =====
function loadUserData() {
    const savedUser = localStorage.getItem('pixelart_currentUser');
    if (savedUser) {
        state.currentUser = savedUser;
        state.savedArtworks = JSON.parse(localStorage.getItem(`pixelart_artworks_${savedUser}`) || '{}');
        state.pixelData = JSON.parse(localStorage.getItem(`pixelart_current_${savedUser}`) || '[]');
    }
}

function updateLoginUI() {
    if (state.currentUser) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('creatorScreen').classList.add('active');
        document.getElementById('userDisplay').textContent = `👤 ${state.currentUser}`;
        initializeCreator();
        loadSavedArtworks();
    } else {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('creatorScreen').classList.remove('active');
    }
}

document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        state.currentUser = username;
        localStorage.setItem('pixelart_currentUser', username);
        state.savedArtworks = JSON.parse(localStorage.getItem(`pixelart_artworks_${username}`) || '{}');
        state.pixelData = JSON.parse(localStorage.getItem(`pixelart_current_${username}`) || '[]');
        updateLoginUI();
        document.getElementById('usernameInput').value = '';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    saveCurrentArtwork();
    state.currentUser = null;
    localStorage.removeItem('pixelart_currentUser');
    state.pixelData = [];
    state.history = [];
    updateLoginUI();
});

// ===== CREATOR INITIALIZATION =====
function initializeCreator() {
    createPixelCanvas();
    setupEventListeners();
    updateColorPreview();
}

function createPixelCanvas() {
    const canvas = document.getElementById('pixelCanvas');
    canvas.innerHTML = '';
    const size = state.gridSize;
    canvas.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    canvas.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    // Calculate pixel size for 400px canvas
    const pixelSize = Math.max(8, Math.floor(400 / size));
    
    for (let i = 0; i < size * size; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.style.width = pixelSize + 'px';
        pixel.style.height = pixelSize + 'px';
        pixel.setAttribute('data-index', i);
        
        if (state.pixelData[i]) {
            pixel.style.background = state.pixelData[i];
        }
        
        pixel.addEventListener('click', () => paintPixel(i, pixel));
        pixel.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) paintPixel(i, pixel);
        });
        
        canvas.appendChild(pixel);
    }
}

function paintPixel(index, pixelElement) {
    const oldColor = state.pixelData[index] || 'white';
    const newColor = state.currentColor;
    
    if (oldColor !== newColor) {
        state.history.push({...state.pixelData});
        state.pixelData[index] = newColor;
        pixelElement.style.background = newColor;
    }
}

// ===== COLOR PICKER =====
function updateColorPreview() {
    const red = document.getElementById('redSlider').value;
    const green = document.getElementById('greenSlider').value;
    const blue = document.getElementById('blueSlider').value;
    
    state.currentColor = `rgb(${red}, ${green}, ${blue})`;
    document.getElementById('colorPreview').style.background = state.currentColor;
    
    document.getElementById('redValue').textContent = red;
    document.getElementById('greenValue').textContent = green;
    document.getElementById('blueValue').textContent = blue;
}

document.getElementById('redSlider').addEventListener('input', updateColorPreview);
document.getElementById('greenSlider').addEventListener('input', updateColorPreview);
document.getElementById('blueSlider').addEventListener('input', updateColorPreview);

// ===== GRID SIZE CHANGE =====
document.getElementById('gridSizeSelect').addEventListener('change', (e) => {
    state.gridSize = parseInt(e.target.value);
    state.pixelData = [];
    state.history = [];
    createPixelCanvas();
});

// ===== TOOLS =====
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
        state.history.push({...state.pixelData});
        state.pixelData = [];
        createPixelCanvas();
    }
});

document.getElementById('undoBtn').addEventListener('click', () => {
    if (state.history.length > 0) {
        state.pixelData = state.history.pop();
        createPixelCanvas();
    }
});

// ===== EEVEELUTION GALLERY =====
document.getElementById('eeveelutionBtn').addEventListener('click', () => {
    document.getElementById('eeveelutionGallery').classList.add('active');
    renderEeveelutionGallery();
});

document.getElementById('closeGalleryBtn').addEventListener('click', () => {
    document.getElementById('eeveelutionGallery').classList.remove('active');
});

function renderEeveelutionGallery() {
    const grid = document.getElementById('eeveelutionGrid');
    grid.innerHTML = '';
    
    eeveelutions.forEach((eevee, index) => {
        const item = document.createElement('div');
        item.className = 'eeveelution-item';
        item.innerHTML = `
            <div class="eeveelution-preview">${eevee.emoji}</div>
            <div class="eeveelution-name">${eevee.name}</div>
        `;
        item.addEventListener('click', () => {
            copyEeveelution(eevee);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        grid.appendChild(item);
    });
}

function copyEeveelution(eevee) {
    state.history.push({...state.pixelData});
    const pattern = eeveelutionPatterns[eevee.name];
    
    if (pattern) {
        // Set grid size to 48x48 for detailed Eeveelution patterns
        state.gridSize = pattern.width;
        state.pixelData = [];
        
        // Load pattern data
        for (let row = 0; row < pattern.height; row++) {
            for (let col = 0; col < pattern.width; col++) {
                const char = pattern.data[row].charAt(col);
                const color = pattern.colorMap[char];
                state.pixelData[row * pattern.width + col] = color || 'white';
            }
        }
        
        document.getElementById('gridSizeSelect').value = state.gridSize;
    }
    
    createPixelCanvas();
}

// ===== SAVE/LOAD =====
document.getElementById('saveBtn').addEventListener('click', () => {
    document.getElementById('saveDialog').classList.add('active');
});

document.getElementById('closeSaveDialogBtn').addEventListener('click', () => {
    document.getElementById('saveDialog').classList.remove('active');
});

document.getElementById('cancelSaveBtn').addEventListener('click', () => {
    document.getElementById('saveDialog').classList.remove('active');
});

document.getElementById('confirmSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('artworkNameInput').value.trim();
    if (name) {
        const id = Date.now();
        state.savedArtworks[id] = {
            name: name,
            data: [...state.pixelData],
            date: new Date().toLocaleDateString(),
            gridSize: state.gridSize
        };
        localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
        loadSavedArtworks();
        document.getElementById('saveDialog').classList.remove('active');
        document.getElementById('artworkNameInput').value = '';
        alert('✨ Artwork saved!');
    }
});

function loadSavedArtworks() {
    const list = document.getElementById('savedArtworksList');
    list.innerHTML = '';
    
    if (Object.keys(state.savedArtworks).length === 0) {
        list.innerHTML = '<p class="empty-message">No saved artworks yet!</p>';
        return;
    }
    
    Object.entries(state.savedArtworks).forEach(([id, artwork]) => {
        const item = document.createElement('div');
        item.className = 'saved-artwork-item';
        item.innerHTML = `
            <div class="artwork-name">${artwork.name}</div>
            <div class="artwork-date">${artwork.date}</div>
        `;
        item.addEventListener('click', () => loadArtwork(id, artwork));
        list.appendChild(item);
    });
}

function loadArtwork(id, artwork) {
    state.gridSize = artwork.gridSize;
    state.pixelData = [...artwork.data];
    state.history = [];
    document.getElementById('gridSizeSelect').value = state.gridSize;
    createPixelCanvas();
}

function saveCurrentArtwork() {
    localStorage.setItem(`pixelart_current_${state.currentUser}`, JSON.stringify(state.pixelData));
}

// Save before leaving
window.addEventListener('beforeunload', () => {
    if (state.currentUser) {
        saveCurrentArtwork();
    }
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Additional event listeners can go here
}
