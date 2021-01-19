const NpcStates = {
    ChasingSlime: 'chasingSlime', // на пути к мобу
    Attacking: 'attacking', // атака моба
    ChasingObject: 'chasingObject', // на пути к объекту (золото / зелье)
    UseObject: 'useObject',     // использование объекта
    Following: 'following',     // следование
    Dead: 'dead'            // ничего не делать
}


export default NpcStates;