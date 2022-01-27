import { Link } from "react-router-dom";
import React, { ReactElement } from "react";
import styles from "./Home.scss";

export const Home = (): ReactElement => (
  <div>
    <h3>
      <Link to="/form">
        Go to dependent lists page
      </Link>
    </h3>
    <div className={styles.text}>
      <p>
        На одном из моих бывших проектов бизнес-аналитик предоставил требования по содержимому зависимых списков в
        Excel файле. Надо было реализовать зависимые списки, источником данных для которых был один объект.
        Предполагалось что, когда мы выбираем значение в родительском списке, зависимый список извлекает ссылку на его
        элементы по постоянному пути типа объект_с_данными/имя_родительского_списка/dependencyLink, ссылка не должна
        была иметь динамических составляющих.
      </p>

      <p>
        Итак, как говорят на собеседованиях: «Пожалуйста реализуйте следующую функцию…». На входе имеем строку со
        специальными символами, означающими границы строк и столбцов страницы, на выходе необходимо получить некий
        объект, который будет необходим для корректной работы зависимых списков, с учетом изложенного в первом абзаце.
      </p>
      <p>
        Мне стало интересно, я просидел часов 16 и создал рабочий прототип, который потом никому не понадобился.
      </p>
      <p>
        Недавно я подумал, что надо бы подвести итоги моего опыта программирования и решил оформить логику работы
        зависимых списков в проект с использованием React, MobX и TypeScript. Поскольку я не мог использовать данные
        реального проекта, пришлось спарсить часть навигационного меню Barclays Bank (https://www.barclays.co.uk/), так
        как оно подошло по количеству уровней вложенности.
      </p>
      <p>И так, что было сделано:</p>
      <ul>
        <li>в ручную сконфигурированы Webpack, ESLint, StyleLint;</li>
        <li>создан React проект без использования create-react-app;</li>
        <li>проработана структура проекта;</li>
        <li>
          подготовлены исходные данные, в виде массива строк, как будто после некоторого преобразования данных из Excel
          файла;
        </li>
        <li>
          реализована логика обработки исходных данных для создания единого объекта (см. src/app/features/form/services/PrepareDataService.ts);
        </li>
        <li>
          реализована логика отображения и работы зависимых списков.
        </li>
      </ul>
    </div>
  </div>
);
