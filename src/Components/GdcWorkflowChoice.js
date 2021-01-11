import React, { useState, useEffect } from "react";
import DataFetch from "./DataFetch";
import { Col } from "react-bootstrap";
import "../App.css";

export default function GdcWorkflowChoice(props) {
  const [gdcWorkflows, setGdcWorkflows] = useState([]);
  const [uniqueWorkflow, setUniqueWorkflow] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState([]);
  const [startDataFetch, setStartDataFetch] = useState(false);

  function getGdcWorkflows() {
    fetch("https://api.gdc.cancer.gov/v0/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
                query WorkflowFileCounts($filters: FiltersArgument) {
                    viewer {
                        repository {
                    files {
                          hits(first: 1000, filters: $filters) {
                            edges {
                              node {
                               file_id
                               data_category
                            data_type
                            analysis{
                                workflow_type
                            }
                            
                            }
                        }
                    } }
                   }}
                      }`,
        variables: {
          filters: {
            op: "and",
            content: [
              {
                op: "in",
                content: {
                  field: "cases.project.project_id",
                  value: props.project,
                },
              },
              {
                op: "in",
                content: {
                  field: "data_category",
                  value: props.category,
                },
              },
              {
                op: "in",
                content: {
                  field: "data_type",
                  value: props.dataType,
                },
              },
            ],
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setGdcWorkflows(res.data.viewer.repository.files.hits.edges);
      });
  }

  useEffect(() => {
    getGdcWorkflows();
  }, [props.dataType]);

  useEffect(() => {
    showWorkflows();
  }, [gdcWorkflows]);

  function showWorkflows() {
    let helperSet = new Set();
    gdcWorkflows.map((workflow) =>
      helperSet.add(workflow.node.analysis.workflow_type)
    );
    setUniqueWorkflow(Array.from(helperSet));
  }

  const handleChange = (e) => {
    const selection = e.target.id;

    if (e.target.checked) {
      setSelectedWorkflow([...selectedWorkflow, selection]);
    } else {
      const index = selectedWorkflow.indexOf(selection);
      setSelectedWorkflow((prev) => prev.slice(index, 1));
    }
  };

  useEffect(() => {
    if (selectedWorkflow.length !== 0) {
      setStartDataFetch(true);
    } else {
      setStartDataFetch(false);
    }
    console.log(selectedWorkflow);
  }, [selectedWorkflow]);

  return (
    <>
      <Col md="6" xl="3">
        <h3>Workflow</h3>
        {uniqueWorkflow ? (
          <fieldset>
            <div className="form-group">
              {uniqueWorkflow.map((workflow) => (
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={workflow}
                    onChange={handleChange}
                  />
                  <label className="custom-control-label" for={workflow}>
                    {workflow}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <h1>loading available GDC workflows...</h1>
        )}
      </Col>
      <div>
        {startDataFetch && (
          <>
            <DataFetch
              dataType={props.dataType}
              workflow={selectedWorkflow}
              category={props.category}
              project={props.project}
            />
          </>
        )}
      </div>
    </>
  );
}
