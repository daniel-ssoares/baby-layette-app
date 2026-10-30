namespace Enxoval.Domain;

public enum Prioridade { Alta = 1, Media = 2, Baixa = 3 }

public enum StatusItem { Pendente, Parcial, Concluido }

/// <summary>Origem dos itens já adquiridos. Itens ganhados não entram no gasto (RN04).</summary>
public enum OrigemItem { Comprado, Ganhado }

public enum SexoBebe { NaoInformado, Feminino, Masculino }

/// <summary>Para qual clima o item é indicado.</summary>
public enum Clima { Todos, Frio, Calor }

public enum Estacao { Verao, Outono, Inverno, Primavera }

/// <summary>Tema visual do app (cores e desenho), escolhido pelo casal.</summary>
public enum TemaVisual { Oliveira, Cerejeira, Lavanda, Pessego, Jardim, Ceu, Oceano, Ursinho }
